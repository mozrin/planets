import { pbkdf2Sync, randomBytes, timingSafeEqual } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { createServer } from 'node:http';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const port = Number(process.env.PORT ?? 3000);
const dataDirectory = process.env.DATA_DIRECTORY ?? join(dirname(fileURLToPath(import.meta.url)), '..', 'data');
mkdirSync(dataDirectory, { recursive: true });

const database = new DatabaseSync(join(dataDirectory, 'planets.sqlite'));
type User = { email: string; name: string };
type AuthBody = { name?: unknown; email?: unknown; password?: unknown };
database.exec(`
  CREATE TABLE IF NOT EXISTS users (
    email TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS sessions_expires_at ON sessions(expires_at);
`);

const json = (response: ServerResponse, status: number, body: unknown) => {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
};

const readBody = (request: IncomingMessage) => new Promise<AuthBody>((resolve, reject) => {
  let body = '';
  request.on('data', (chunk: Buffer) => {
    body += chunk;
    if (body.length > 20_000) reject(new Error('Request body is too large.'));
  });
  request.on('end', () => {
    try { resolve(body ? JSON.parse(body) as AuthBody : {}); } catch { reject(new Error('Invalid JSON.')); }
  });
  request.on('error', reject);
});

const normalizeEmail = (value: unknown) => String(value ?? '').trim().toLowerCase();
const validEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const passwordHash = (password: string, salt: string) => pbkdf2Sync(password, salt, 310_000, 32, 'sha256').toString('hex');
const requestCookies = (request: IncomingMessage): Record<string, string> => Object.fromEntries((request.headers.cookie ?? '').split(';').map((part) => part.trim().split('=').map(decodeURIComponent)).filter(([key]) => key));
const sessionCookie = (id: string, maxAge = 60 * 60 * 24 * 7) => [
  `session=${encodeURIComponent(id)}`, 'Path=/', 'HttpOnly', 'SameSite=Lax', `Max-Age=${maxAge}`,
  ...(process.env.NODE_ENV === 'production' ? ['Secure'] : [])
].join('; ');

const sessionUser = (request: IncomingMessage): User | null => {
  const sessionId = requestCookies(request).session;
  if (!sessionId) return null;
  const row = database.prepare(`SELECT users.email, users.name FROM sessions JOIN users ON users.email = sessions.user_email WHERE sessions.id = ? AND sessions.expires_at > ?`).get(sessionId, Date.now());
  return row as User | null;
};

const sendUser = (response: ServerResponse, user: User, sessionId: string) => {
  response.setHeader('set-cookie', sessionCookie(sessionId));
  json(response, 201, { user });
};

createServer(async (request: IncomingMessage, response: ServerResponse) => {
  const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);
  if (request.method === 'GET' && url.pathname === '/api/health') return json(response, 200, { status: 'ok' });
  if (request.method === 'GET' && url.pathname === '/api/auth/me') return json(response, 200, { user: sessionUser(request) });

  if (request.method === 'POST' && url.pathname === '/api/auth/logout') {
    const sessionId = requestCookies(request).session;
    if (sessionId) database.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
    response.setHeader('set-cookie', sessionCookie('', 0));
    return json(response, 200, { ok: true });
  }

  if (request.method === 'POST' && (url.pathname === '/api/auth/register' || url.pathname === '/api/auth/login')) {
    try {
      const body = await readBody(request);
      const email = normalizeEmail(body.email);
      const password = String(body.password ?? '');
      if (!validEmail(email) || password.length < 8) return json(response, 400, { error: 'Enter a valid email and a password of at least 8 characters.' });

      let user: User;
      if (url.pathname.endsWith('/register')) {
        const name = String(body.name ?? '').trim();
        if (name.length < 2 || name.length > 80) return json(response, 400, { error: 'Enter your name (2–80 characters).' });
        if (database.prepare('SELECT email FROM users WHERE email = ?').get(email)) return json(response, 409, { error: 'An account already exists for that email. Please sign in.' });
        const salt = randomBytes(16).toString('hex');
        database.prepare('INSERT INTO users (email, name, password_hash, password_salt) VALUES (?, ?, ?, ?)').run(email, name, passwordHash(password, salt), salt);
        user = { email, name };
      } else {
        const record = database.prepare('SELECT email, name, password_hash, password_salt FROM users WHERE email = ?').get(email) as (User & { password_hash: string; password_salt: string }) | undefined;
        if (!record) return json(response, 401, { error: 'Email or password is incorrect.' });
        const expected = Buffer.from(record.password_hash, 'hex');
        const actual = Buffer.from(passwordHash(password, record.password_salt), 'hex');
        if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return json(response, 401, { error: 'Email or password is incorrect.' });
        user = { email: record.email, name: record.name };
      }

      database.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(Date.now());
      const sessionId = randomBytes(32).toString('base64url');
      database.prepare('INSERT INTO sessions (id, user_email, expires_at) VALUES (?, ?, ?)').run(sessionId, user.email, Date.now() + 7 * 24 * 60 * 60 * 1000);
      return sendUser(response, user, sessionId);
    } catch (error) {
      return json(response, 400, { error: error instanceof Error ? error.message : 'Could not process that request.' });
    }
  }

  return json(response, 404, { error: 'Not found' });
}).listen(port, '0.0.0.0', () => console.log(`Server listening on ${port}`));

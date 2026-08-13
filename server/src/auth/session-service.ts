import { randomBytes } from "node:crypto";
import type { IncomingMessage } from "node:http";
import type { DatabaseSync } from "node:sqlite";
import type { User } from "./types.ts";

export function requestCookies(request: IncomingMessage): Record<string, string> {
  return Object.fromEntries(
    (request.headers.cookie ?? "")
      .split(";")
      .map((part) => part.trim().split("=").map(decodeURIComponent))
      .filter(([key]) => key),
  );
}

export function sessionCookie(id: string, maximumAge = 60 * 60 * 24 * 7) {
  return [
    `session=${encodeURIComponent(id)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maximumAge}`,
    ...(process.env.NODE_ENV === "production" ? ["Secure"] : []),
  ].join("; ");
}

export function sessionUser(database: DatabaseSync, request: IncomingMessage, now = Date.now()): User | null {
  const sessionId = requestCookies(request).session;
  if (!sessionId) return null;
  const row = database.prepare("SELECT users.email, users.name FROM sessions JOIN users ON users.email = sessions.user_email WHERE sessions.id = ? AND sessions.expires_at > ?").get(sessionId, now) as User | undefined;
  return row ? { email: row.email, name: row.name } : null;
}

export function createSession(database: DatabaseSync, userEmail: string, durationMilliseconds: number, now = Date.now()) {
  database.prepare("DELETE FROM sessions WHERE expires_at <= ?").run(now);
  const id = randomBytes(32).toString("base64url");
  database.prepare("INSERT INTO sessions (id, user_email, expires_at) VALUES (?, ?, ?)").run(id, userEmail, now + durationMilliseconds);
  return id;
}

export function destroySession(database: DatabaseSync, sessionId: string | undefined) {
  if (sessionId) database.prepare("DELETE FROM sessions WHERE id = ?").run(sessionId);
}

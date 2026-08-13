import assert from "node:assert/strict";
import test from "node:test";
import type { IncomingMessage } from "node:http";
import { DatabaseSync } from "node:sqlite";
import { authenticateUser, AuthenticationError, registerUser } from "./authentication-service.ts";
import { createSession, destroySession, sessionUser } from "./session-service.ts";

function database() {
  const instance = new DatabaseSync(":memory:");
  instance.exec("CREATE TABLE users (email TEXT PRIMARY KEY, name TEXT NOT NULL, password_hash TEXT NOT NULL, password_salt TEXT NOT NULL); CREATE TABLE sessions (id TEXT PRIMARY KEY, user_email TEXT NOT NULL, expires_at INTEGER NOT NULL);");
  return instance;
}

function request(cookie: string) {
  return { headers: { cookie } } as IncomingMessage;
}

test("registration normalizes an email and authentication preserves the user", () => {
  const store = database();
  assert.deepEqual(registerUser(store, { name: "Atlas Researcher", email: "  Researcher@Example.org ", password: "astronomy" }), { name: "Atlas Researcher", email: "researcher@example.org" });
  assert.deepEqual(authenticateUser(store, { email: "researcher@example.org", password: "astronomy" }), { name: "Atlas Researcher", email: "researcher@example.org" });
});

test("authentication rejects duplicate and invalid credentials with stable statuses", () => {
  const store = database();
  registerUser(store, { name: "Atlas Researcher", email: "researcher@example.org", password: "astronomy" });
  assert.throws(() => registerUser(store, { name: "Atlas Researcher", email: "researcher@example.org", password: "astronomy" }), (error: unknown) => error instanceof AuthenticationError && error.status === 409);
  assert.throws(() => authenticateUser(store, { email: "researcher@example.org", password: "wrongpass" }), (error: unknown) => error instanceof AuthenticationError && error.status === 401);
});

test("sessions resolve and revoke an existing user", () => {
  const store = database();
  const user = registerUser(store, { name: "Atlas Researcher", email: "researcher@example.org", password: "astronomy" });
  const id = createSession(store, user.email, 1_000, 10);
  assert.deepEqual(sessionUser(store, request(`session=${id}`), 11), user);
  destroySession(store, id);
  assert.equal(sessionUser(store, request(`session=${id}`), 11), null);
});

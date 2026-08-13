import { randomBytes } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import { hashPassword, isValidEmail, normalizeEmail, passwordMatches } from "./passwords.ts";
import type { AuthBody, User } from "./types.ts";

export class AuthenticationError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function registerUser(database: DatabaseSync, body: AuthBody): User {
  const email = normalizeEmail(body.email);
  const password = String(body.password ?? "");
  const name = String(body.name ?? "").trim();
  if (!isValidEmail(email) || password.length < 8) {
    throw new AuthenticationError(400, "Enter a valid email and a password of at least 8 characters.");
  }
  if (name.length < 2 || name.length > 80) {
    throw new AuthenticationError(400, "Enter your name (2–80 characters).");
  }
  if (database.prepare("SELECT email FROM users WHERE email = ?").get(email)) {
    throw new AuthenticationError(409, "An account already exists for that email. Please sign in.");
  }
  const salt = randomBytes(16).toString("hex");
  database.prepare("INSERT INTO users (email, name, password_hash, password_salt) VALUES (?, ?, ?, ?)").run(email, name, hashPassword(password, salt), salt);
  return { email, name };
}

export function authenticateUser(database: DatabaseSync, body: AuthBody): User {
  const email = normalizeEmail(body.email);
  const password = String(body.password ?? "");
  if (!isValidEmail(email) || password.length < 8) {
    throw new AuthenticationError(400, "Enter a valid email and a password of at least 8 characters.");
  }
  const record = database.prepare("SELECT email, name, password_hash, password_salt FROM users WHERE email = ?").get(email) as (User & { password_hash: string; password_salt: string }) | undefined;
  if (!record || !passwordMatches(password, record.password_hash, record.password_salt)) {
    throw new AuthenticationError(401, "Email or password is incorrect.");
  }
  return { email: record.email, name: record.name };
}

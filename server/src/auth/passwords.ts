import { pbkdf2Sync, timingSafeEqual } from "node:crypto";

export function normalizeEmail(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function hashPassword(password: string, salt: string) {
  return pbkdf2Sync(password, salt, 310_000, 32, "sha256").toString("hex");
}

export function passwordMatches(password: string, expectedHash: string, salt: string) {
  const expected = Buffer.from(expectedHash, "hex");
  const actual = Buffer.from(hashPassword(password, salt), "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

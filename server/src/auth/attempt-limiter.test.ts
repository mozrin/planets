import assert from "node:assert/strict";
import test from "node:test";
import { assertAttemptAllowed, clearAttempts, recordFailedAttempt } from "./attempt-limiter.ts";

test("limiter blocks after the configured number of failures and resets after its window", () => {
  const key = "test:researcher@example.org";
  clearAttempts(key);
  recordFailedAttempt(key, 100, 1_000);
  recordFailedAttempt(key, 100, 1_001);
  assert.throws(() => assertAttemptAllowed(key, 2, 100, 1_002), /Too many sign-in attempts/);
  assert.doesNotThrow(() => assertAttemptAllowed(key, 2, 100, 1_101));
  clearAttempts(key);
});

import assert from "node:assert/strict";
import test from "node:test";
import { readRuntime } from "./runtime.ts";

test("runtime accepts configured positive integers", () => {
  const runtime = readRuntime({ PORT: "3200", AUTH_ATTEMPT_LIMIT: "3" });
  assert.equal(runtime.port, 3200);
  assert.equal(runtime.authAttemptLimit, 3);
});

test("runtime rejects unsafe numeric configuration", () => {
  assert.throws(() => readRuntime({ PORT: "not-a-port" }), /PORT must be a positive integer/);
  assert.throws(() => readRuntime({ AUTH_ATTEMPT_LIMIT: "0" }), /AUTH_ATTEMPT_LIMIT must be a positive integer/);
});

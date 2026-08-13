import assert from "node:assert/strict";
import test from "node:test";
import { readiness } from "./health.ts";

test("readiness requires a successful, fresh sync", () => {
  assert.equal(readiness({ completed_at: 9_500, record_count: 6_336, last_error: null }, 1_000, 10_000).ready, true);
  assert.equal(readiness({ completed_at: 8_000, record_count: 6_336, last_error: null }, 1_000, 10_000).ready, false);
  assert.equal(readiness({ completed_at: 9_500, record_count: 6_336, last_error: "upstream unavailable" }, 1_000, 10_000).ready, false);
});

import assert from "node:assert/strict";
import test from "node:test";
import { fetchNasaPlanets } from "./nasa-client.ts";

test("NASA client accepts a non-empty archive response", async () => {
  const rows = await fetchNasaPlanets(async () => new Response(JSON.stringify([{ pl_name: "Atlas b" }]), { status: 200 }));
  assert.equal(rows[0]?.pl_name, "Atlas b");
});

test("NASA client exposes upstream failures", async () => {
  await assert.rejects(fetchNasaPlanets(async () => new Response("unavailable", { status: 503 })), /NASA archive returned 503/);
});

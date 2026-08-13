import assert from "node:assert/strict";
import test from "node:test";
import type { IncomingMessage, ServerResponse } from "node:http";
import { sendJson, sendJsonError } from "./json-response.ts";
import { createRouter, requestUrl } from "./router.ts";

const request = (method: string, path: string) => ({ method, url: path, headers: { host: "atlas.test" } }) as IncomingMessage;

test("requestUrl preserves paths and query parameters", () => {
  const url = requestUrl(request("GET", "/api/planets?limit=30"));
  assert.equal(url.pathname, "/api/planets");
  assert.equal(url.searchParams.get("limit"), "30");
});

test("router dispatches only matching method and pathname", async () => {
  let handled = false;
  const router = createRouter([{ method: "GET", pathname: "/api/health", handle: () => { handled = true; } }]);
  const response = {} as never;
  assert.equal(await router(request("GET", "/api/health"), response), true);
  assert.equal(handled, true);
  assert.equal(await router(request("POST", "/api/health"), response), false);
});

test("JSON responses preserve status and error shape", () => {
  let status = 0;
  let body = "";
  const response = {
    writeHead: (value: number) => { status = value; },
    end: (value: string) => { body = value; },
  } as unknown as ServerResponse;
  sendJson(response, 201, { user: "atlas" });
  assert.equal(status, 201);
  assert.deepEqual(JSON.parse(body), { user: "atlas" });
  sendJsonError(response, 404, "Not found");
  assert.equal(status, 404);
  assert.deepEqual(JSON.parse(body), { error: "Not found" });
});

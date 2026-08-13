import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdtemp, rm } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { spawn, type ChildProcess } from "node:child_process";
import test from "node:test";

async function availablePort() {
  const probe = createServer();
  probe.listen(0, "127.0.0.1");
  await once(probe, "listening");
  const address = probe.address();
  if (!address || typeof address === "string") throw new Error("Could not reserve a test port.");
  const { port } = address;
  await new Promise<void>((resolve, reject) => probe.close((error) => error ? reject(error) : resolve()));
  return port;
}

async function waitFor(url: string) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try { if ((await fetch(url)).ok) return; } catch { /* Server is still starting. */ }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function request(baseUrl: string, path: string, options: RequestInit = {}) {
  return fetch(`${baseUrl}${path}`, options).then(async (response) => ({ response, body: await response.json() as Record<string, unknown> }));
}

test("HTTP contracts cover registration, sessions, protected catalogue access, and logout", { timeout: 30_000 }, async (context) => {
  const directory = await mkdtemp(join(tmpdir(), "planets-api-test-"));
  const port = await availablePort();
  const serverDirectory = basename(process.cwd()) === "server" ? process.cwd() : join(process.cwd(), "server");
  const child: ChildProcess = spawn(process.execPath, ["src/server.ts"], { cwd: serverDirectory, env: { ...process.env, NODE_ENV: "test", PORT: String(port), DATA_DIRECTORY: directory, BACKUP_DIRECTORY: join(directory, "backups") }, stdio: "ignore" });
  context.after(async () => {
    if (child.exitCode === null && !child.killed) {
      child.kill();
      await once(child, "exit").catch(() => undefined);
    }
    await rm(directory, { recursive: true, force: true });
  });

  const baseUrl = `http://127.0.0.1:${port}`;
  await waitFor(`${baseUrl}/api/health/live`);
  const unauthenticated = await request(baseUrl, "/api/planets");
  assert.equal(unauthenticated.response.status, 401);
  assert.deepEqual(unauthenticated.body, { error: "Sign in to access The Planetary Atlas." });

  const registration = await request(baseUrl, "/api/auth/register", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: "Atlas Researcher", email: "researcher@example.org", password: "astronomy" }) });
  assert.equal(registration.response.status, 201);
  assert.deepEqual(registration.body, { user: { name: "Atlas Researcher", email: "researcher@example.org" } });
  const cookie = registration.response.headers.get("set-cookie")?.split(";", 1)[0];
  assert.ok(cookie, "registration must issue a session cookie");

  const catalogue = await request(baseUrl, "/api/planets?query=Kepler-22", { headers: { cookie } });
  assert.equal(catalogue.response.status, 200);
  assert.deepEqual(Object.keys(catalogue.body).sort(), ["limit", "nextOffset", "offset", "records", "total"]);
  assert.ok(Array.isArray(catalogue.body.records));

  const logout = await request(baseUrl, "/api/auth/logout", { method: "POST", headers: { cookie } });
  assert.equal(logout.response.status, 200);
  const afterLogout = await request(baseUrl, "/api/auth/me", { headers: { cookie } });
  assert.deepEqual(afterLogout.body, { user: null });
});

import { createServer } from "node:http";
import type { ServerResponse } from "node:http";
import { authenticateUser, AuthenticationError, registerUser } from "./auth/authentication-service.ts";
import { createSession, destroySession, requestCookies, sessionCookie, sessionUser } from "./auth/session-service.ts";
import type { AuthBody, User } from "./auth/types.ts";
import { planetPage, planetSyncStatus } from "./catalogue/repository.ts";
import { synchronisePlanetsIfStale } from "./catalogue/sync-service.ts";
import { runtime } from "./config/runtime.ts";
import { database } from "./database/database.ts";
import { initialiseDatabase } from "./database/schema.ts";
import { sendJson, sendJsonError } from "./http/json-response.ts";
import { readJsonBody } from "./http/read-json-body.ts";
import { createRouter } from "./http/router.ts";
import type { RouteContext } from "./http/router.ts";

initialiseDatabase();

function sendUser(response: ServerResponse, user: User, sessionId: string) {
  response.setHeader("set-cookie", sessionCookie(sessionId));
  sendJson(response, 201, { user });
}

const router = createRouter([
  { method: "GET", pathname: "/api/health", handle: ({ response }) => sendJson(response, 200, { status: "ok", planetSync: planetSyncStatus(database) }) },
  { method: "GET", pathname: "/api/auth/me", handle: ({ request, response }) => sendJson(response, 200, { user: sessionUser(database, request) }) },
  { method: "GET", pathname: "/api/planets", handle: ({ request, response, url }) => {
    if (!sessionUser(database, request)) return sendJsonError(response, 401, "Sign in to access The Planetary Atlas.");
    sendJson(response, 200, planetPage(database, url));
  } },
  { method: "POST", pathname: "/api/auth/logout", handle: ({ request, response }) => {
    destroySession(database, requestCookies(request).session);
    response.setHeader("set-cookie", sessionCookie("", 0));
    sendJson(response, 200, { ok: true });
  } },
  ...["/api/auth/register", "/api/auth/login"].map((pathname) => ({ method: "POST", pathname, handle: async ({ request, response }: RouteContext) => {
    try {
      const body = await readJsonBody<AuthBody>(request);
      const user = pathname.endsWith("/register") ? registerUser(database, body) : authenticateUser(database, body);
      sendUser(response, user, createSession(database, user.email, runtime.sessionDurationMilliseconds));
    } catch (error) {
      if (error instanceof AuthenticationError) return sendJsonError(response, error.status, error.message);
      sendJsonError(response, 400, error instanceof Error ? error.message : "Could not process that request.");
    }
  } })),
]);

const server = createServer(async (request, response) => {
  if (!(await router(request, response))) sendJsonError(response, 404, "Not found");
});

function refreshCatalogue() {
  return synchronisePlanetsIfStale(database, runtime.planetSyncIntervalMilliseconds).catch((error) => {
    console.error(`Planet sync failed: ${error instanceof Error ? error.message : "Unknown planet sync error."}`);
  });
}

export function startApplication() {
  server.listen(runtime.port, "0.0.0.0", () => {
    console.log(`Server listening on ${runtime.port}`);
    void refreshCatalogue();
  });
  setInterval(() => void refreshCatalogue(), runtime.planetSyncIntervalMilliseconds).unref();
}

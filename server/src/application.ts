import { createServer } from "node:http";
import type { ServerResponse } from "node:http";
import { authenticateUser, AuthenticationError, registerUser } from "./auth/authentication-service.ts";
import { createSession, destroySession, requestCookies, sessionCookie, sessionUser } from "./auth/session-service.ts";
import type { AuthBody, User } from "./auth/types.ts";
import { runtime } from "./config/runtime.ts";
import { database } from "./database/database.ts";
import { initialiseDatabase } from "./database/schema.ts";
import { sendJson, sendJsonError } from "./http/json-response.ts";
import { readJsonBody } from "./http/read-json-body.ts";
import { createRouter } from "./http/router.ts";
import type { RouteContext } from "./http/router.ts";

const port = runtime.port;
type NasaPlanet = {
  pl_name: string;
  hostname: string | null;
  pl_rade: number | null;
  pl_bmasse: number | null;
  pl_orbper: number | null;
  pl_orbsmax: number | null;
  pl_eqt: number | null;
  pl_insol: number | null;
  sy_dist: number | null;
  disc_method: string | null;
  disc_year: number | null;
  st_teff: number | null;
  st_rad: number | null;
  st_mass: number | null;
  st_lum: number | null;
};
const syncIntervalMilliseconds = runtime.planetSyncIntervalMilliseconds;
const nasaFields =
  "pl_name,hostname,pl_rade,pl_bmasse,pl_orbper,pl_orbsmax,pl_eqt,pl_insol,sy_dist,disc_method,disc_year,st_teff,st_rad,st_mass,st_lum";
const nasaQuery = `select ${nasaFields} from pscomppars`;
const nasaArchiveUrl = `https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=${encodeURIComponent(nasaQuery)}&format=json`;
initialiseDatabase();
/*
  CREATE TABLE IF NOT EXISTS users (
    email TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS sessions_expires_at ON sessions(expires_at);
  CREATE TABLE IF NOT EXISTS planets (
    name TEXT PRIMARY KEY, host_star TEXT, radius_earth REAL, mass_earth REAL,
    orbital_period_days REAL, semi_major_axis_au REAL, equilibrium_temperature_kelvin REAL,
    insolation_earth REAL, distance_parsecs REAL, discovery_method TEXT, discovery_year INTEGER,
    star_temperature_kelvin REAL, star_radius_solar REAL, star_mass_solar REAL, star_luminosity_log REAL,
    source TEXT NOT NULL, synced_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS planets_host_star ON planets(host_star);
  CREATE INDEX IF NOT EXISTS planets_discovery_method ON planets(discovery_method);
  CREATE TABLE IF NOT EXISTS sync_status (
    dataset TEXT PRIMARY KEY, completed_at INTEGER, record_count INTEGER NOT NULL DEFAULT 0,
    source_url TEXT NOT NULL, last_error TEXT
  );
*/

let syncingPlanets = false;
const numberOrNull = (value: number | null) =>
  Number.isFinite(value) ? value : null;

const synchronisePlanets = async () => {
  if (syncingPlanets) return;
  syncingPlanets = true;
  try {
    const response = await fetch(nasaArchiveUrl, {
      signal: AbortSignal.timeout(120_000),
    });
    if (!response.ok)
      throw new Error(`NASA archive returned ${response.status}.`);
    const rows = (await response.json()) as NasaPlanet[];
    if (!Array.isArray(rows) || rows.length === 0)
      throw new Error("NASA archive returned no planet records.");
    const timestamp = new Date().toISOString();
    const insert = database.prepare(
      `INSERT INTO planets VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    database.exec("BEGIN IMMEDIATE;");
    try {
      database.exec("DELETE FROM planets;");
      for (const planet of rows)
        insert.run(
          planet.pl_name,
          planet.hostname,
          numberOrNull(planet.pl_rade),
          numberOrNull(planet.pl_bmasse),
          numberOrNull(planet.pl_orbper),
          numberOrNull(planet.pl_orbsmax),
          numberOrNull(planet.pl_eqt),
          numberOrNull(planet.pl_insol),
          numberOrNull(planet.sy_dist),
          planet.disc_method,
          planet.disc_year,
          numberOrNull(planet.st_teff),
          numberOrNull(planet.st_rad),
          numberOrNull(planet.st_mass),
          numberOrNull(planet.st_lum),
          "NASA Exoplanet Archive / PSCompPars",
          timestamp,
        );
      database
        .prepare(
          `INSERT INTO sync_status (dataset, completed_at, record_count, source_url, last_error) VALUES ('nasa-pscomppars', ?, ?, ?, NULL) ON CONFLICT(dataset) DO UPDATE SET completed_at = excluded.completed_at, record_count = excluded.record_count, source_url = excluded.source_url, last_error = NULL`,
        )
        .run(Date.now(), rows.length, nasaArchiveUrl);
      database.exec("COMMIT;");
    } catch (error) {
      database.exec("ROLLBACK;");
      throw error;
    }
    console.log(
      `Synced ${rows.length} planets from the NASA Exoplanet Archive.`,
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown planet sync error.";
    database
      .prepare(
        `INSERT INTO sync_status (dataset, source_url, last_error) VALUES ('nasa-pscomppars', ?, ?) ON CONFLICT(dataset) DO UPDATE SET last_error = excluded.last_error`,
      )
      .run(nasaArchiveUrl, message);
    console.error(`Planet sync failed: ${message}`);
  } finally {
    syncingPlanets = false;
  }
};

const synchronisePlanetsIfStale = async () => {
  const status = database
    .prepare(
      `SELECT completed_at FROM sync_status WHERE dataset = 'nasa-pscomppars'`,
    )
    .get() as { completed_at: number | null } | undefined;
  if (
    !status?.completed_at ||
    Date.now() - status.completed_at >= syncIntervalMilliseconds
  )
    await synchronisePlanets();
};

const sendUser = (response: ServerResponse, user: User, sessionId: string) => {
  response.setHeader("set-cookie", sessionCookie(sessionId));
  sendJson(response, 201, { user });
};

const planetSorts = {
  name: "name COLLATE NOCASE ASC",
  distance: "distance_parsecs ASC NULLS LAST, name COLLATE NOCASE ASC",
  discovery: "discovery_year DESC NULLS LAST, name COLLATE NOCASE ASC",
  radius: "radius_earth DESC NULLS LAST, name COLLATE NOCASE ASC",
  temperature:
    "equilibrium_temperature_kelvin ASC NULLS LAST, name COLLATE NOCASE ASC",
} as const;
type PlanetSort = keyof typeof planetSorts;

const planetPage = (url: URL) => {
  const requestedLimit = Number(url.searchParams.get("limit") ?? 30);
  const limit = Number.isInteger(requestedLimit)
    ? Math.min(Math.max(requestedLimit, 1), 60)
    : 30;
  const requestedOffset = Number(url.searchParams.get("offset") ?? 0);
  const offset =
    Number.isInteger(requestedOffset) && requestedOffset >= 0
      ? requestedOffset
      : 0;
  const query = url.searchParams.get("query")?.trim() ?? "";
  const sort = url.searchParams.get("sort") as PlanetSort;
  const order = planetSorts[sort] ?? planetSorts.name;
  const where = query
    ? `WHERE name LIKE ? COLLATE NOCASE OR host_star LIKE ? COLLATE NOCASE OR discovery_method LIKE ? COLLATE NOCASE`
    : "";
  const search = `%${query}%`;
  const parameters = query ? [search, search, search] : [];
  const total = database
    .prepare(`SELECT COUNT(*) AS count FROM planets ${where}`)
    .get(...parameters) as { count: number };
  const records = database
    .prepare(
      `SELECT name, host_star, radius_earth, mass_earth, orbital_period_days, semi_major_axis_au, equilibrium_temperature_kelvin, insolation_earth, distance_parsecs, discovery_method, discovery_year, star_temperature_kelvin, star_radius_solar, star_mass_solar, star_luminosity_log, source, synced_at FROM planets ${where} ORDER BY ${order} LIMIT ? OFFSET ?`,
    )
    .all(...parameters, limit, offset);
  return {
    records,
    total: total.count,
    offset,
    limit,
    nextOffset:
      offset + records.length < total.count ? offset + records.length : null,
  };
};

const router = createRouter([
  {
    method: "GET",
    pathname: "/api/health",
    handle: ({ response }) => {
      const sync = database
        .prepare(
          `SELECT completed_at, record_count, last_error FROM sync_status WHERE dataset = 'nasa-pscomppars'`,
        )
        .get();
      sendJson(response, 200, {
        status: "ok",
        planetSync: sync ?? {
          completed_at: null,
          record_count: 0,
          last_error: null,
        },
      });
    },
  },
  {
    method: "GET",
    pathname: "/api/auth/me",
    handle: ({ request, response }) => sendJson(response, 200, { user: sessionUser(database, request) }),
  },
  {
    method: "GET",
    pathname: "/api/planets",
    handle: ({ request, response, url }) => {
      if (!sessionUser(database, request))
        return sendJsonError(response, 401, "Sign in to access The Planetary Atlas.");
      sendJson(response, 200, planetPage(url));
    },
  },
  {
    method: "POST",
    pathname: "/api/auth/logout",
    handle: ({ request, response }) => {
      const sessionId = requestCookies(request).session;
      destroySession(database, sessionId);
      response.setHeader("set-cookie", sessionCookie("", 0));
      sendJson(response, 200, { ok: true });
    },
  },
  ...["/api/auth/register", "/api/auth/login"].map((pathname) => ({
    method: "POST",
    pathname,
    handle: async ({ request, response }: RouteContext) => {
      try {
        const body = await readJsonBody<AuthBody>(request);
        const user = pathname.endsWith("/register") ? registerUser(database, body) : authenticateUser(database, body);
        const sessionId = createSession(database, user.email, runtime.sessionDurationMilliseconds);
        return sendUser(response, user, sessionId);
      } catch (error) {
        if (error instanceof AuthenticationError) return sendJsonError(response, error.status, error.message);
        return sendJsonError(response, 400, error instanceof Error ? error.message : "Could not process that request.");
      }
    },
  })),
]);

const server = createServer(async (request, response) => {
  if (!(await router(request, response))) {
    sendJsonError(response, 404, "Not found");
  }
});

export const startApplication = () => {
  server.listen(port, "0.0.0.0", () => {
    console.log(`Server listening on ${port}`);
    void synchronisePlanetsIfStale();
  });
  setInterval(
    () => void synchronisePlanetsIfStale(),
    syncIntervalMilliseconds,
  ).unref();
};

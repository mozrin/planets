import { pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";
import { createServer } from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";
import { runtime } from "./config/runtime.ts";
import { database } from "./database/database.ts";
import { initialiseDatabase } from "./database/schema.ts";

const port = runtime.port;
type User = { email: string; name: string };
type AuthBody = { name?: unknown; email?: unknown; password?: unknown };
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

const json = (response: ServerResponse, status: number, body: unknown) => {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(body));
};

const readBody = (request: IncomingMessage) =>
  new Promise<AuthBody>((resolve, reject) => {
    let body = "";
    request.on("data", (chunk: Buffer) => {
      body += chunk;
      if (body.length > 20_000) reject(new Error("Request body is too large."));
    });
    request.on("end", () => {
      try {
        resolve(body ? (JSON.parse(body) as AuthBody) : {});
      } catch {
        reject(new Error("Invalid JSON."));
      }
    });
    request.on("error", reject);
  });

const normalizeEmail = (value: unknown) =>
  String(value ?? "")
    .trim()
    .toLowerCase();
const validEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const passwordHash = (password: string, salt: string) =>
  pbkdf2Sync(password, salt, 310_000, 32, "sha256").toString("hex");
const requestCookies = (request: IncomingMessage): Record<string, string> =>
  Object.fromEntries(
    (request.headers.cookie ?? "")
      .split(";")
      .map((part) => part.trim().split("=").map(decodeURIComponent))
      .filter(([key]) => key),
  );
const sessionCookie = (id: string, maxAge = 60 * 60 * 24 * 7) =>
  [
    `session=${encodeURIComponent(id)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
    ...(process.env.NODE_ENV === "production" ? ["Secure"] : []),
  ].join("; ");

const sessionUser = (request: IncomingMessage): User | null => {
  const sessionId = requestCookies(request).session;
  if (!sessionId) return null;
  const row = database
    .prepare(
      `SELECT users.email, users.name FROM sessions JOIN users ON users.email = sessions.user_email WHERE sessions.id = ? AND sessions.expires_at > ?`,
    )
    .get(sessionId, Date.now());
  return row as User | null;
};

const sendUser = (response: ServerResponse, user: User, sessionId: string) => {
  response.setHeader("set-cookie", sessionCookie(sessionId));
  json(response, 201, { user });
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

const server = createServer(
  async (request: IncomingMessage, response: ServerResponse) => {
    const url = new URL(
      request.url ?? "/",
      `http://${request.headers.host ?? "localhost"}`,
    );
    if (request.method === "GET" && url.pathname === "/api/health") {
      const sync = database
        .prepare(
          `SELECT completed_at, record_count, last_error FROM sync_status WHERE dataset = 'nasa-pscomppars'`,
        )
        .get();
      return json(response, 200, {
        status: "ok",
        planetSync: sync ?? {
          completed_at: null,
          record_count: 0,
          last_error: null,
        },
      });
    }
    if (request.method === "GET" && url.pathname === "/api/auth/me")
      return json(response, 200, { user: sessionUser(request) });
    if (request.method === "GET" && url.pathname === "/api/planets") {
      if (!sessionUser(request))
        return json(response, 401, {
          error: "Sign in to access The Planetary Atlas.",
        });
      return json(response, 200, planetPage(url));
    }

    if (request.method === "POST" && url.pathname === "/api/auth/logout") {
      const sessionId = requestCookies(request).session;
      if (sessionId)
        database.prepare("DELETE FROM sessions WHERE id = ?").run(sessionId);
      response.setHeader("set-cookie", sessionCookie("", 0));
      return json(response, 200, { ok: true });
    }

    if (
      request.method === "POST" &&
      (url.pathname === "/api/auth/register" ||
        url.pathname === "/api/auth/login")
    ) {
      try {
        const body = await readBody(request);
        const email = normalizeEmail(body.email);
        const password = String(body.password ?? "");
        if (!validEmail(email) || password.length < 8)
          return json(response, 400, {
            error:
              "Enter a valid email and a password of at least 8 characters.",
          });

        let user: User;
        if (url.pathname.endsWith("/register")) {
          const name = String(body.name ?? "").trim();
          if (name.length < 2 || name.length > 80)
            return json(response, 400, {
              error: "Enter your name (2–80 characters).",
            });
          if (
            database
              .prepare("SELECT email FROM users WHERE email = ?")
              .get(email)
          )
            return json(response, 409, {
              error:
                "An account already exists for that email. Please sign in.",
            });
          const salt = randomBytes(16).toString("hex");
          database
            .prepare(
              "INSERT INTO users (email, name, password_hash, password_salt) VALUES (?, ?, ?, ?)",
            )
            .run(email, name, passwordHash(password, salt), salt);
          user = { email, name };
        } else {
          const record = database
            .prepare(
              "SELECT email, name, password_hash, password_salt FROM users WHERE email = ?",
            )
            .get(email) as
            | (User & { password_hash: string; password_salt: string })
            | undefined;
          if (!record)
            return json(response, 401, {
              error: "Email or password is incorrect.",
            });
          const expected = Buffer.from(record.password_hash, "hex");
          const actual = Buffer.from(
            passwordHash(password, record.password_salt),
            "hex",
          );
          if (
            expected.length !== actual.length ||
            !timingSafeEqual(expected, actual)
          )
            return json(response, 401, {
              error: "Email or password is incorrect.",
            });
          user = { email: record.email, name: record.name };
        }

        database
          .prepare("DELETE FROM sessions WHERE expires_at <= ?")
          .run(Date.now());
        const sessionId = randomBytes(32).toString("base64url");
        database
          .prepare(
            "INSERT INTO sessions (id, user_email, expires_at) VALUES (?, ?, ?)",
          )
          .run(sessionId, user.email, Date.now() + runtime.sessionDurationMilliseconds);
        return sendUser(response, user, sessionId);
      } catch (error) {
        return json(response, 400, {
          error:
            error instanceof Error
              ? error.message
              : "Could not process that request.",
        });
      }
    }

    return json(response, 404, { error: "Not found" });
  },
);

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

import type { DatabaseSync } from "node:sqlite";

const sorts = { name: "name COLLATE NOCASE ASC", distance: "distance_parsecs ASC NULLS LAST, name COLLATE NOCASE ASC", discovery: "discovery_year DESC NULLS LAST, name COLLATE NOCASE ASC", radius: "radius_earth DESC NULLS LAST, name COLLATE NOCASE ASC", temperature: "equilibrium_temperature_kelvin ASC NULLS LAST, name COLLATE NOCASE ASC" } as const;
const number = (value: string | null, minimum: number, maximum: number) => { const parsed = Number(value); return Number.isFinite(parsed) && parsed >= minimum && parsed <= maximum ? parsed : null; };

export function planetPage(database: DatabaseSync, url: URL) {
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 30) || 30, 1), 60);
  const offset = Math.max(Number(url.searchParams.get("offset") ?? 0) || 0, 0);
  const query = url.searchParams.get("query")?.trim().slice(0, 120) ?? "";
  const method = url.searchParams.get("method")?.trim().slice(0, 80) ?? "";
  const where: string[] = []; const parameters: (string | number)[] = [];
  if (query) { where.push("(name LIKE ? COLLATE NOCASE OR host_star LIKE ? COLLATE NOCASE OR discovery_method LIKE ? COLLATE NOCASE OR source LIKE ? COLLATE NOCASE)"); parameters.push(...Array(4).fill(`%${query}%`)); }
  if (method) { where.push("discovery_method = ? COLLATE NOCASE"); parameters.push(method); }
  const radiusMin = number(url.searchParams.get("radiusMin"), 0, 1000); if (radiusMin !== null) { where.push("radius_earth >= ?"); parameters.push(radiusMin); }
  const radiusMax = number(url.searchParams.get("radiusMax"), 0, 1000); if (radiusMax !== null) { where.push("radius_earth <= ?"); parameters.push(radiusMax); }
  const distanceMax = number(url.searchParams.get("distanceMax"), 0, 100000); if (distanceMax !== null) { where.push("distance_parsecs <= ?"); parameters.push(distanceMax); }
  const yearMin = number(url.searchParams.get("yearMin"), 1600, 2100); if (yearMin !== null) { where.push("discovery_year >= ?"); parameters.push(yearMin); }
  if (url.searchParams.get("measurements") === "radius") where.push("radius_earth IS NOT NULL");
  if (url.searchParams.get("habitability") === "temperate") where.push("equilibrium_temperature_kelvin BETWEEN 200 AND 320");
  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const order = sorts[url.searchParams.get("sort") as keyof typeof sorts] ?? sorts.name;
  const total = database.prepare(`SELECT COUNT(*) AS count FROM planets ${clause}`).get(...parameters) as { count: number };
  const records = database.prepare(`SELECT name, host_star, radius_earth, mass_earth, orbital_period_days, semi_major_axis_au, equilibrium_temperature_kelvin, insolation_earth, distance_parsecs, discovery_method, discovery_year, star_temperature_kelvin, star_radius_solar, star_mass_solar, star_luminosity_log, source, synced_at FROM planets ${clause} ORDER BY ${order} LIMIT ? OFFSET ?`).all(...parameters, limit, offset);
  return { records, total: total.count, offset, limit, nextOffset: offset + records.length < total.count ? offset + records.length : null };
}

export function planetSyncStatus(database: DatabaseSync) { return database.prepare("SELECT completed_at, record_count, last_error FROM sync_status WHERE dataset = 'nasa-pscomppars'").get() ?? { completed_at: null, record_count: 0, last_error: null }; }

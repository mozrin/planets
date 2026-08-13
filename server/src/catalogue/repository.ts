import type { DatabaseSync } from "node:sqlite";

const sorts = { name: "name COLLATE NOCASE ASC", distance: "distance_parsecs ASC NULLS LAST, name COLLATE NOCASE ASC", discovery: "discovery_year DESC NULLS LAST, name COLLATE NOCASE ASC", radius: "radius_earth DESC NULLS LAST, name COLLATE NOCASE ASC", temperature: "equilibrium_temperature_kelvin ASC NULLS LAST, name COLLATE NOCASE ASC" } as const;

export function planetPage(database: DatabaseSync, url: URL) {
  const requestedLimit = Number(url.searchParams.get("limit") ?? 30);
  const limit = Number.isInteger(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 60) : 30;
  const requestedOffset = Number(url.searchParams.get("offset") ?? 0);
  const offset = Number.isInteger(requestedOffset) && requestedOffset >= 0 ? requestedOffset : 0;
  const query = url.searchParams.get("query")?.trim() ?? "";
  const order = sorts[url.searchParams.get("sort") as keyof typeof sorts] ?? sorts.name;
  const where = query ? "WHERE name LIKE ? COLLATE NOCASE OR host_star LIKE ? COLLATE NOCASE OR discovery_method LIKE ? COLLATE NOCASE" : "";
  const parameters = query ? Array(3).fill(`%${query}%`) : [];
  const total = database.prepare(`SELECT COUNT(*) AS count FROM planets ${where}`).get(...parameters) as { count: number };
  const records = database.prepare(`SELECT name, host_star, radius_earth, mass_earth, orbital_period_days, semi_major_axis_au, equilibrium_temperature_kelvin, insolation_earth, distance_parsecs, discovery_method, discovery_year, star_temperature_kelvin, star_radius_solar, star_mass_solar, star_luminosity_log, source, synced_at FROM planets ${where} ORDER BY ${order} LIMIT ? OFFSET ?`).all(...parameters, limit, offset);
  return { records, total: total.count, offset, limit, nextOffset: offset + records.length < total.count ? offset + records.length : null };
}

export function planetSyncStatus(database: DatabaseSync) {
  return database.prepare("SELECT completed_at, record_count, last_error FROM sync_status WHERE dataset = 'nasa-pscomppars'").get() ?? { completed_at: null, record_count: 0, last_error: null };
}

import type { DatabaseSync } from "node:sqlite";
import { fetchNasaPlanets, nasaArchiveUrl, nasaDataset, nasaFieldDefinitions, type NasaPlanet } from "./nasa-client.ts";

const value = (number: number | null) => Number.isFinite(number) ? number : null;
function validate(rows: NasaPlanet[]) { const names = new Set<string>(); if (rows.length < 100) throw new Error("NASA archive response is too small to promote safely."); for (const row of rows) { if (!row || typeof row.pl_name !== "string" || !row.pl_name.trim()) throw new Error("NASA archive contains a planet without a valid name."); if (names.has(row.pl_name)) throw new Error(`NASA archive contains duplicate planet name ${row.pl_name}.`); names.add(row.pl_name); } }
export async function synchronisePlanets(database: DatabaseSync, fetcher: typeof fetch = fetch) {
  try {
    const rows = await fetchNasaPlanets(fetcher); validate(rows); const timestamp = new Date().toISOString();
    const insert = database.prepare("INSERT INTO planets VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    database.exec("BEGIN IMMEDIATE;");
    try { database.exec("DELETE FROM planets;"); for (const planet of rows) insert.run(planet.pl_name, planet.hostname, value(planet.pl_rade), value(planet.pl_bmasse), value(planet.pl_orbper), value(planet.pl_orbsmax), value(planet.pl_eqt), value(planet.pl_insol), value(planet.sy_dist), planet.disc_method, planet.disc_year, value(planet.st_teff), value(planet.st_rad), value(planet.st_mass), value(planet.st_lum), "NASA Exoplanet Archive / PSCompPars", timestamp); database.prepare("INSERT INTO sync_runs (dataset, retrieved_at, record_count, source_url, field_definitions) VALUES (?, ?, ?, ?, ?)").run(nasaDataset, timestamp, rows.length, nasaArchiveUrl, nasaFieldDefinitions); database.prepare("INSERT INTO sync_status (dataset, completed_at, record_count, source_url, last_error) VALUES ('nasa-pscomppars', ?, ?, ?, NULL) ON CONFLICT(dataset) DO UPDATE SET completed_at = excluded.completed_at, record_count = excluded.record_count, source_url = excluded.source_url, last_error = NULL").run(Date.now(), rows.length, nasaArchiveUrl); database.exec("COMMIT;"); } catch (error) { database.exec("ROLLBACK;"); throw error; }
    return rows.length;
  } catch (error) { const message = error instanceof Error ? error.message : "Unknown planet sync error."; database.prepare("INSERT INTO sync_status (dataset, source_url, last_error) VALUES ('nasa-pscomppars', ?, ?) ON CONFLICT(dataset) DO UPDATE SET last_error = excluded.last_error").run(nasaArchiveUrl, message); throw error; }
}
export async function synchronisePlanetsIfStale(database: DatabaseSync, interval: number, fetcher: typeof fetch = fetch) { const status = database.prepare("SELECT completed_at FROM sync_status WHERE dataset = 'nasa-pscomppars'").get() as { completed_at: number | null } | undefined; if (!status?.completed_at || Date.now() - status.completed_at >= interval) return synchronisePlanets(database, fetcher); }

import assert from "node:assert/strict";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";
import { synchronisePlanets } from "./sync-service.ts";

function database() {
  const store = new DatabaseSync(":memory:");
  store.exec(`CREATE TABLE planets (name TEXT PRIMARY KEY, host_star TEXT, radius_earth REAL, mass_earth REAL, orbital_period_days REAL, semi_major_axis_au REAL, equilibrium_temperature_kelvin REAL, insolation_earth REAL, distance_parsecs REAL, discovery_method TEXT, discovery_year INTEGER, star_temperature_kelvin REAL, star_radius_solar REAL, star_mass_solar REAL, star_luminosity_log REAL, source TEXT NOT NULL, synced_at TEXT NOT NULL);
    CREATE TABLE sync_runs (id INTEGER PRIMARY KEY, dataset TEXT NOT NULL, retrieved_at TEXT NOT NULL, record_count INTEGER NOT NULL, source_url TEXT NOT NULL, field_definitions TEXT NOT NULL);
    CREATE TABLE sync_status (dataset TEXT PRIMARY KEY, completed_at INTEGER, record_count INTEGER NOT NULL DEFAULT 0, source_url TEXT NOT NULL, last_error TEXT);`);
  return store;
}

test("a failed ingestion preserves the prior catalogue and records the error", async () => {
  const store = database();
  store.prepare("INSERT INTO planets VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run("Existing b", null, null, null, null, null, null, null, null, null, null, null, null, null, null, "fixture", "2026-01-01T00:00:00.000Z");
  const incompleteArchive = [{ pl_name: "Only one row", hostname: null, pl_rade: null, pl_bmasse: null, pl_orbper: null, pl_orbsmax: null, pl_eqt: null, pl_insol: null, sy_dist: null, disc_method: null, disc_year: null, st_teff: null, st_rad: null, st_mass: null, st_lum: null }];

  await assert.rejects(synchronisePlanets(store, async () => new Response(JSON.stringify(incompleteArchive))), /too small to promote safely/);

  assert.equal((store.prepare("SELECT COUNT(*) AS count FROM planets").get() as { count: number }).count, 1);
  assert.match((store.prepare("SELECT last_error FROM sync_status").get() as { last_error: string }).last_error, /too small to promote safely/);
});

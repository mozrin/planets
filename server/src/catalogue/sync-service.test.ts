import assert from "node:assert/strict";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";
import { synchronisePlanets } from "./sync-service.ts";
import { planetPage } from "./repository.ts";

function database() {
  const store = new DatabaseSync(":memory:");
  store.exec(`CREATE TABLE planets (name TEXT PRIMARY KEY, host_star TEXT, radius_earth REAL, mass_earth REAL, orbital_period_days REAL, semi_major_axis_au REAL, equilibrium_temperature_kelvin REAL, insolation_earth REAL, distance_parsecs REAL, discovery_method TEXT, discovery_year INTEGER, star_temperature_kelvin REAL, star_radius_solar REAL, star_mass_solar REAL, star_luminosity_log REAL, source TEXT NOT NULL, synced_at TEXT NOT NULL);
    CREATE TABLE sync_runs (id INTEGER PRIMARY KEY, dataset TEXT NOT NULL, retrieved_at TEXT NOT NULL, record_count INTEGER NOT NULL, source_url TEXT NOT NULL, field_definitions TEXT NOT NULL);
    CREATE TABLE sync_status (dataset TEXT PRIMARY KEY, completed_at INTEGER, record_count INTEGER NOT NULL DEFAULT 0, source_url TEXT NOT NULL, last_error TEXT);
    CREATE TABLE sources (id INTEGER PRIMARY KEY, code TEXT NOT NULL UNIQUE, name TEXT NOT NULL, product TEXT NOT NULL, citation TEXT NOT NULL, license TEXT NOT NULL, credit TEXT NOT NULL, url TEXT NOT NULL);
    CREATE TABLE source_fields (source_id INTEGER NOT NULL, field_name TEXT NOT NULL, source_field TEXT NOT NULL, unit TEXT, null_semantics TEXT NOT NULL, uncertainty TEXT NOT NULL, derivation TEXT NOT NULL, PRIMARY KEY(source_id, field_name));
    CREATE TABLE planet_field_values (id INTEGER PRIMARY KEY, planet_name TEXT NOT NULL, source_id INTEGER NOT NULL, field_name TEXT NOT NULL, source_field TEXT NOT NULL, numeric_value REAL, text_value TEXT, unit TEXT, null_semantics TEXT NOT NULL, uncertainty TEXT NOT NULL, derivation TEXT NOT NULL, retrieved_at TEXT NOT NULL);`);
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

test("sync records append-only source-specific values and exposes field provenance", async () => {
  const store = database();
  const rows = Array.from({ length: 100 }, (_, index) => ({ pl_name: `Atlas-${index} b`, hostname: "Atlas", pl_rade: 1.2, pl_bmasse: 2.3, pl_orbper: 4.5, pl_orbsmax: 0.04, pl_eqt: 280, pl_insol: 1.1, sy_dist: 12, disc_method: "Transit", disc_year: 2026, st_teff: 5700, st_rad: 1, st_mass: 1, st_lum: 0 }));
  const fetcher = async () => new Response(JSON.stringify(rows));

  await synchronisePlanets(store, fetcher);
  await synchronisePlanets(store, fetcher);

  assert.equal((store.prepare("SELECT COUNT(*) AS count FROM sources").get() as { count: number }).count, 1);
  assert.equal((store.prepare("SELECT COUNT(*) AS count FROM planet_field_values").get() as { count: number }).count, 3_000);
  assert.equal((store.prepare("SELECT COUNT(*) AS count FROM planets").get() as { count: number }).count, 100);
  const page = planetPage(store, new URL("https://atlas.test/api/planets"));
  assert.equal(page.total, 100);
  assert.equal(page.records.length, 30);
  const record = page.records[0] as unknown as { provenance: { sources: Array<{ product: string; fields: Array<{ field: string; unit: string | null }> }> } };
  assert.equal(record.provenance.sources[0]?.product, "Planetary Systems Composite Parameters (PSCompPars)");
  assert.deepEqual(record.provenance.sources[0]?.fields.find((field) => field.field === "radius_earth"), { field: "radius_earth", sourceField: "pl_rade", value: 1.2, unit: "Earth radii", nullSemantics: "NULL means no composite radius is reported.", uncertainty: "Not included in this ingestion.", derivation: "PSCompPars composite parameter." });
});

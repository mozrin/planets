import { database } from "./database.ts";

export const initialiseDatabase = () => database.exec(`
  CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, name TEXT NOT NULL, password_hash TEXT NOT NULL, password_salt TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
  CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, user_email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE, expires_at INTEGER NOT NULL);
  CREATE INDEX IF NOT EXISTS sessions_expires_at ON sessions(expires_at);
  CREATE TABLE IF NOT EXISTS planets (name TEXT PRIMARY KEY, host_star TEXT, radius_earth REAL, mass_earth REAL, orbital_period_days REAL, semi_major_axis_au REAL, equilibrium_temperature_kelvin REAL, insolation_earth REAL, distance_parsecs REAL, discovery_method TEXT, discovery_year INTEGER, star_temperature_kelvin REAL, star_radius_solar REAL, star_mass_solar REAL, star_luminosity_log REAL, source TEXT NOT NULL, synced_at TEXT NOT NULL);
  CREATE INDEX IF NOT EXISTS planets_host_star ON planets(host_star);
  CREATE INDEX IF NOT EXISTS planets_discovery_method ON planets(discovery_method);
  CREATE TABLE IF NOT EXISTS sync_status (dataset TEXT PRIMARY KEY, completed_at INTEGER, record_count INTEGER NOT NULL DEFAULT 0, source_url TEXT NOT NULL, last_error TEXT);
`);

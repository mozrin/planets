export type NasaPlanet = { pl_name: string; hostname: string | null; pl_rade: number | null; pl_bmasse: number | null; pl_orbper: number | null; pl_orbsmax: number | null; pl_eqt: number | null; pl_insol: number | null; sy_dist: number | null; disc_method: string | null; disc_year: number | null; st_teff: number | null; st_rad: number | null; st_mass: number | null; st_lum: number | null };
const fields = "pl_name,hostname,pl_rade,pl_bmasse,pl_orbper,pl_orbsmax,pl_eqt,pl_insol,sy_dist,disc_method,disc_year,st_teff,st_rad,st_mass,st_lum";
export const nasaDataset = "PSCompPars";
export const nasaFieldDefinitions = fields;
export const nasaArchiveUrl = `https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=${encodeURIComponent(`select ${fields} from pscomppars`)}&format=json`;
export async function fetchNasaPlanets(fetcher: typeof fetch = fetch) {
  const response = await fetcher(nasaArchiveUrl, { signal: AbortSignal.timeout(120_000) });
  if (!response.ok) throw new Error(`NASA archive returned ${response.status}.`);
  const rows = await response.json() as NasaPlanet[];
  if (!Array.isArray(rows) || rows.length === 0) throw new Error("NASA archive returned no planet records.");
  return rows;
}

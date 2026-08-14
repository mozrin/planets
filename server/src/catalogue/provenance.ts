export type SourceField = {
  sourceField: string;
  field: string;
  unit: string | null;
  nullSemantics: string;
  uncertainty: string;
  derivation: string;
};

export const nasaSource = {
  code: "nasa-pscomppars",
  name: "NASA Exoplanet Archive",
  product: "Planetary Systems Composite Parameters (PSCompPars)",
  citation: "NASA Exoplanet Archive, Planetary Systems Composite Parameters table (PSCompPars).",
  license: "NASA open data; consult the NASA Exoplanet Archive terms for source-specific conditions.",
  credit: "NASA Exoplanet Archive / Caltech-IPAC",
  url: "https://exoplanetarchive.ipac.caltech.edu/",
};

export const nasaSourceFields: SourceField[] = [
  { sourceField: "pl_name", field: "planet_name", unit: null, nullSemantics: "Required identifier; a missing value rejects the ingestion.", uncertainty: "Not provided by PSCompPars.", derivation: "Archive catalogue identifier." },
  { sourceField: "hostname", field: "host_star", unit: null, nullSemantics: "NULL means the archive has no host-star value.", uncertainty: "Not provided by PSCompPars.", derivation: "Archive catalogue value." },
  { sourceField: "pl_rade", field: "radius_earth", unit: "Earth radii", nullSemantics: "NULL means no composite radius is reported.", uncertainty: "Not included in this ingestion.", derivation: "PSCompPars composite parameter." },
  { sourceField: "pl_bmasse", field: "mass_earth", unit: "Earth masses", nullSemantics: "NULL means no composite mass is reported.", uncertainty: "Not included in this ingestion.", derivation: "PSCompPars composite parameter." },
  { sourceField: "pl_orbper", field: "orbital_period_days", unit: "days", nullSemantics: "NULL means no orbital period is reported.", uncertainty: "Not included in this ingestion.", derivation: "PSCompPars composite parameter." },
  { sourceField: "pl_orbsmax", field: "semi_major_axis_au", unit: "AU", nullSemantics: "NULL means no semi-major axis is reported.", uncertainty: "Not included in this ingestion.", derivation: "PSCompPars composite parameter." },
  { sourceField: "pl_eqt", field: "equilibrium_temperature_kelvin", unit: "K", nullSemantics: "NULL means no equilibrium temperature is reported.", uncertainty: "Not included in this ingestion.", derivation: "PSCompPars derived parameter." },
  { sourceField: "pl_insol", field: "insolation_earth", unit: "Earth flux", nullSemantics: "NULL means no insolation is reported.", uncertainty: "Not included in this ingestion.", derivation: "PSCompPars derived parameter." },
  { sourceField: "sy_dist", field: "distance_parsecs", unit: "pc", nullSemantics: "NULL means no distance is reported.", uncertainty: "Not included in this ingestion.", derivation: "PSCompPars catalogue value." },
  { sourceField: "disc_method", field: "discovery_method", unit: null, nullSemantics: "NULL means no discovery method is reported.", uncertainty: "Not applicable.", derivation: "Archive classification." },
  { sourceField: "disc_year", field: "discovery_year", unit: "year", nullSemantics: "NULL means no discovery year is reported.", uncertainty: "Not applicable.", derivation: "Archive classification." },
  { sourceField: "st_teff", field: "star_temperature_kelvin", unit: "K", nullSemantics: "NULL means no stellar temperature is reported.", uncertainty: "Not included in this ingestion.", derivation: "PSCompPars stellar parameter." },
  { sourceField: "st_rad", field: "star_radius_solar", unit: "Solar radii", nullSemantics: "NULL means no stellar radius is reported.", uncertainty: "Not included in this ingestion.", derivation: "PSCompPars stellar parameter." },
  { sourceField: "st_mass", field: "star_mass_solar", unit: "Solar masses", nullSemantics: "NULL means no stellar mass is reported.", uncertainty: "Not included in this ingestion.", derivation: "PSCompPars stellar parameter." },
  { sourceField: "st_lum", field: "star_luminosity_log", unit: "log10(Solar luminosity)", nullSemantics: "NULL means no stellar luminosity is reported.", uncertainty: "Not included in this ingestion.", derivation: "PSCompPars stellar parameter." },
];

# Catalogue data methods

The Atlas is a scientist-first **discovery and orientation workspace**, not a replacement for source-specific scientific analysis. Its local catalogue is a daily, queryable snapshot of the NASA Exoplanet Archive Planetary Systems Composite Parameters table (`PSCompPars`).

## Why `PSCompPars`

`PSCompPars` provides broad confirmed-planet coverage suitable for searching, comparing, and finding a record to investigate. Values in a composite row may come from different refereed publications. They are useful entry-point measurements, but are not necessarily one internally consistent fit.

When a result needs source-consistent parameters, uncertainties, full field coverage, or publication-level provenance, follow the source links and query the NASA Archive directly. The Atlas currently does not ingest the NASA `PS` table or mission-specific products such as light curves, spectra, or images.

## Local snapshot and freshness

The server requests these fields once per successful sync:

| Local field | NASA field | Meaning |
| --- | --- | --- |
| `name`, `host_star` | `pl_name`, `hostname` | Planet and system identifiers. |
| `radius_earth`, `mass_earth` | `pl_rade`, `pl_bmasse` | Bulk physical constraints in Earth units. |
| `orbital_period_days`, `semi_major_axis_au` | `pl_orbper`, `pl_orbsmax` | Orbital context. |
| `equilibrium_temperature_kelvin`, `insolation_earth` | `pl_eqt`, `pl_insol` | Simplified irradiation context. |
| `distance_parsecs` | `sy_dist` | System distance. |
| `discovery_method`, `discovery_year` | `disc_method`, `disc_year` | Discovery provenance. |
| `star_temperature_kelvin`, `star_radius_solar`, `star_mass_solar`, `star_luminosity_log` | `st_teff`, `st_rad`, `st_mass`, `st_lum` | Host-star context. |

Each successful daily sync records its retrieval timestamp, query URL, row count, and requested field definitions in `sync_runs`; the record itself also carries `source` and `synced_at`. SQL `NULL` means NASA did not supply a local value. The Atlas does not silently estimate missing values.

## Promotion safeguards

An incoming response must be a non-empty JSON array with at least 100 records, a non-empty planet name per record, and unique planet names. Validation happens before the live table is changed. A valid snapshot replaces the catalogue and writes its provenance as one SQLite transaction. On failure, the previous snapshot remains available and `sync_status.last_error` records the failure.

## Interpretation and visualisation

- A composite catalogue value is not direct imaging and does not establish surface appearance, atmosphere, habitability, or life.
- The UI's temperate screening range is a navigation aid based on equilibrium temperature; it is not a habitability conclusion.
- Planet renderings must follow the [planet rendering specifications](../science/planet-rendering-specifications.md) and the [scientific visualization contract](../science/scientific-visualization-contract.md).
- Every external data product, simulation, illustration, or AI-assisted image must carry its evidence class and provenance adjacent to the visual.

For implementation mechanics, see the [NASA ingestion policy](nasa-ingestion.md).

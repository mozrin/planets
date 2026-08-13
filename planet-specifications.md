# Planet rendering specifications

## Purpose

The local SQLite catalogue contains a daily snapshot of NASA Exoplanet Archive's Planetary Systems Composite Parameters (`PSCompPars`) table. Use these fields to create a **scientific illustration** of an exoplanet beside Earth. It is not an observed image and must never be presented as one.

The catalogue has one composite record for each confirmed planet. Its fields may be assembled from more than one refereed source, so individual parameters are useful constraints but are not necessarily one self-consistent published solution.

## Local record fields

The SQLite database is stored in the `server_data` Docker volume as `planets.sqlite`, in the `planets` table. The daily synchronization stores these source values:

| Local field | NASA source field | Units | Rendering use |
| --- | --- | --- |
| `name` | `pl_name` | — | Planet label. |
| `host_star` | `hostname` | — | Host-star label. |
| `radius_earth` | `pl_rade` | Earth radii | Primary size constraint. Render radius relative to Earth at a common scale. |
| `mass_earth` | `pl_bmasse` | Earth masses | Density and gravity context; helps distinguish rocky, volatile-rich, and gas-dominated regimes. |
| `orbital_period_days` | `pl_orbper` | days | Orbital context and animation timing only; not surface appearance by itself. |
| `semi_major_axis_au` | `pl_orbsmax` | AU | Incident-light context when combined with host-star properties. |
| `equilibrium_temperature_kelvin` | `pl_eqt` | K | First-order thermal/colour/atmosphere regime constraint. It is not a surface temperature. |
| `insolation_earth` | `pl_insol` | Earth fluxes | Incident radiation relative to Earth; use alongside equilibrium temperature. |
| `distance_parsecs` | `sy_dist` | parsecs | Viewing-distance metadata only; do not shrink the side-by-side scale illustration because of this. |
| `discovery_method` | `disc_method` | — | Provenance/context, not appearance. |
| `discovery_year` | `disc_year` | year | Provenance/context, not appearance. |
| `star_temperature_kelvin` | `st_teff` | K | Host-star spectral colour and illumination hue. |
| `star_radius_solar` | `st_rad` | Solar radii | Host luminosity/visual star-size context. |
| `star_mass_solar` | `st_mass` | Solar masses | Stellar and orbital context. |
| `star_luminosity_log` | `st_lum` | log10(L/Lsun) | Incident-light context; combine with orbital distance. |
| `source` | generated | — | Identifies NASA PSCompPars. Display as provenance. |
| `synced_at` | generated | ISO-8601 timestamp | Data freshness. Display as provenance. |

Missing values are stored as SQL `NULL`. Never replace a missing measurement with a claimed value. Render the absence as uncertainty or choose a deliberately neutral illustrative treatment.

## Required rendering rules

1. **Scale is measured, not artistic.** If `radius_earth` exists, draw the planet with radius `radius_earth × Earth radius`. Draw Earth at exactly `1 R⊕` beside it using the same scale.
2. **Do not infer surface detail from a name.** Names, discovery method, and distance do not say anything about surface geology or clouds.
3. **Treat appearance as a model.** Use labels such as “Modelled appearance” and “Illustrative atmosphere/surface class.”
4. **Expose the constraints.** Every render should include measured radius, mass when present, equilibrium temperature, insolation, host star, and a NASA source note.
5. **Show uncertainty honestly.** If radius is missing, no physically scaled globe comparison can be made. Use an unscaled marker and say “radius not measured.”

## Interpretation workflow

### 1. Determine physical scale

- `radius_earth` is the source of truth for globe diameter.
- Diameter relative to Earth is also `radius_earth`; both diameters are multiplied by two, so the ratio is unchanged.
- `mass_earth / radius_earth³` is a useful density proxy in Earth-density units when both are available.
- Do not use mass alone to derive radius for the primary rendering. Any mass–radius estimate should be labelled as modelled.

### 2. Establish broad physical regime

These are rough communication categories, not classification claims:

| Available evidence | Cautious illustrative regime |
| --- | --- |
| Radius ≤ 1.6 R⊕ and density proxy broadly rocky | likely rocky-scale world; surface remains unknown. |
| Radius 1.6–3.5 R⊕ | volatile-rich sub-Neptune / mini-Neptune candidate; avoid continents unless independent evidence exists. |
| Radius > 3.5 R⊕ | giant-planet regime; use deep atmosphere/cloud bands, not a solid surface. |
| No radius | unknown physical regime; avoid a globe-scale claim. |

The density proxy is only a heuristic. Measurement uncertainties and composition degeneracies matter.

### 3. Establish illumination and thermal regime

- Prefer `equilibrium_temperature_kelvin` as the direct first-order thermal constraint.
- Use `insolation_earth`, `semi_major_axis_au`, `star_temperature_kelvin`, and `star_luminosity_log` to explain the illumination regime.
- A cooler host star should cast warmer/redder light; a hotter host star should cast bluer/whiter light.
- Equilibrium temperature assumes a simplified energy balance. It cannot determine clouds, greenhouse warming, pressure, weather, ocean state, or surface temperature.

### 4. Select an intentionally conservative appearance

Use sparse, physically suggestive visual cues rather than invented geography:

- **Rocky-scale, temperate-ish:** muted rock/ocean-like palette only if explicitly marked illustrative; add partial cloud or haze rather than detailed continents.
- **Highly irradiated / high equilibrium temperature:** darker lava/rock-like or high-altitude haze palette; do not claim molten surface without stronger evidence.
- **Cold / low insolation:** subdued ice/haze palette; do not claim global ice coverage.
- **Sub-Neptune / giant:** layered, diffuse atmospheric gradients and clouds; do not show a land surface.
- **No adequate constraints:** neutral sphere with a soft terminator and an “appearance unconstrained” label.

## What this dataset cannot tell us

The local catalogue does **not** provide direct images or sufficient evidence for:

- Continents, oceans, vegetation, cities, life, or surface composition
- Atmospheric composition, pressure, cloud cover, weather, or wind
- Rotation period, axial tilt, seasons, magnetic field, or ring system
- True surface temperature or albedo for most planets
- Planet colour, texture, visible appearance, or exact phase function
- A reliable habitability determination

Do not present any of these as measured facts. If an illustration includes them, describe them as a hypothesis or omit them.

## Recommended UI copy

Use this wording near any visual reconstruction:

> Modelled appearance — scaled from measured radius where available. Colour, atmosphere, and surface features are illustrative inferences from bulk properties and stellar irradiation, not direct observations.

Include this provenance line:

> Data: NASA Exoplanet Archive, Planetary Systems Composite Parameters (PSCompPars). Local snapshot synced daily.

# Field-level provenance model

The Planetary Atlas keeps the browsing catalogue separate from its provenance ledger. The `planets` table is a current composite snapshot; it is not the authoritative record of every source-specific value.

## Source registry

`sources` records the source name, product/table, retrieval URL, citation, license guidance, and credit. The initial registered product is NASA Exoplanet Archive's Planetary Systems Composite Parameters (`PSCompPars`) table.

## Field values

Every successful ingestion appends one `planet_field_values` row for each ingested field and planet. A row includes the source field name, normalized Atlas field name, value, unit, retrieval timestamp, null semantics, uncertainty treatment, and derivation statement. Existing rows are never deleted by a later catalogue refresh; this prevents a newly retrieved composite value from silently replacing earlier source-specific evidence.

The current `PSCompPars` import supplies composite values and does not ingest archive uncertainty columns. Its field metadata therefore labels uncertainty as not included, rather than implying zero uncertainty. SQL `NULL` means the source did not provide a value; the Atlas does not estimate it.

## API and profile presentation

`GET /api/planets` adds a `provenance.sources` collection to every returned record. Each source includes citation, license/credit, retrieval time, and its field entries. The planet profile renders this in its **Field provenance** section. Values remain explicitly labelled as catalogue composite values, not direct observations.

# NASA ingestion policy

The Atlas intentionally uses NASA Exoplanet Archive **PSCompPars** as its
local discovery catalogue. It is a composite confirmed-planet table, selected
for broad browsing; it is not a source-consistent substitute for the more
publication-specific `PS` table.

Each successful sync records the dataset, retrieval timestamp, query URL, row
count, and requested field definitions in `sync_runs`. Before promotion, the
incoming response must contain at least 100 uniquely named planets with a
non-empty name. Validation happens before the live table transaction starts;
an unavailable, partial, malformed, or duplicate response preserves the last
known-good catalogue and records the error in `sync_status`.

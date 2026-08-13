# Operations runbook

This runbook covers the current Docker deployment. It is not a production backup strategy; off-host encrypted backup storage is tracked in [#53](https://github.com/mozrin/planets/issues/53).

## Start and verify

1. Set the required tunnel token in the deployment environment. For local work, copy `.env.example` to `.env`, retain `TRAEFIK_HOST=mozrin-planets.mozrin.com`, and use the development token.
2. In local development, ensure the existing Traefik network is available:

   ```sh
   docker network create moznet
   docker compose up --build
   ```

   `docker network create` reports an error if the network already exists; that is harmless.
3. For a production-shaped deployment, configure Cloudflare ingress with `/api` directed to `planets_server:3000` before the catch-all route to `planets_website:3000`, then run `docker compose up -d --build`.
4. Check `GET /api/health/live` for process liveness and `GET /api/health/ready` for a fresh catalogue. A fresh readiness response is the minimum post-deploy check; `GET /api/health` remains a compact compatibility endpoint.

The local URL is always `https://mozrin-planets.mozrin.com`. Do not substitute `localhost`: the host is intentional so browser origin, routing, and tunnel behaviour match deployment.

## Catalogue freshness and incidents

The server tries a catalogue refresh on startup and every 24 hours. A sync fetches NASA's `PSCompPars` table, validates it before changing the live catalogue, and promotes it in one SQLite transaction. The previous healthy snapshot remains available if the response is unavailable, malformed, too small, or contains duplicate planet names.

- Inspect server logs for `catalogue.sync.completed` or `catalogue.sync.failed`.
- Inspect `/api/health/ready`. It returns `503` after two missed daily intervals, and includes sync age and error context.
- Do not manually empty `planets` to force a repair. Restarting the server retries stale data; investigate NASA availability and configuration first.
- Record source provenance from the `sync_runs` table before any manual analysis. It contains the dataset, retrieval time, row count, request URL, and selected fields.

See [NASA ingestion policy](../data/nasa-ingestion.md) and [data methods](../data/data-methods.md) for source choices and limits.

## Database, backups, and recovery

`server_data` contains `planets.sqlite`. `server_backups` contains a consistent SQLite backup made at startup and daily; only the newest seven are retained. Both are Docker named volumes.

To recover a development database:

1. Stop the stack, and make a copy of the existing database in an isolated location.
2. Copy the selected `planets-*.sqlite` backup over `planets.sqlite` in the `server_data` volume.
3. Start the stack and check `/api/health/ready`, authentication, and a sample catalogue query before treating the restore as successful.

`docker compose down -v` deletes both named volumes. That is an intentional development reset, not a recovery procedure. Do not use it when data must be preserved.

## Routine validation

Run these from the repository root before deployment or review:

```sh
npm run verify:conventions
npm run typecheck
npm test
npm run build
```

The CI workflow also builds both production Docker images. Logs are structured JSON so a container platform can collect and alert on the event names above.

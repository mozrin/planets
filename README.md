# The Planetary Atlas

A Node 24 monorepo for a scientist-first exoplanet research workspace.

## Layout

- `server/` — Node API service
- `website/` — mobile-first React 19 website
- `docs/design/` — English design documentation
- `docs/mpd/` — multilingual documentation, copied into the website at build time
- `docs/data/` — catalogue source, ingestion, and scientific-use documentation
- `docs/platform/` — system map, operations runbook, and maintenance policy
- `docs/science/` — rendering and visualization evidence standards
- `docker/<service>/` — service-specific Dockerfiles

Read the [system map](docs/platform/system-map.md) for service boundaries and the [operations runbook](docs/platform/operations-runbook.md) for the complete start, health, ingestion, backup, and recovery procedures.

## Production deployment

1. Copy `.env.example` to `.env` for local development. Set `CLOUDFLARED_TUNNEL_TOKEN` in the production deployment environment; never commit either environment file or a production token.
2. In Cloudflare Zero Trust, configure the `planets.mozrin.com` tunnel ingress rules: `^/api` to `http://planets_server:3000`, then `^/` to `http://planet_website:3000`.
3. Run `docker compose up -d --build`.

No host ports are published. The services share the private `planets_appnet` Docker network. Traefik is not part of the production stack. Cloudflared is the only inbound path and, using the deployed server's tunnel token, routes each request path directly to the relevant internal service.

## Database durability and recovery

SQLite data is stored in the dedicated `server_data` volume. Versioned schema migrations run on startup. The server also writes a consistent SQLite backup on startup and daily to the separate `server_backups` volume, retaining the seven newest backups.

This is development protection only: `docker compose down -v` intentionally removes **both** volumes and starts from an empty system. Before production, [#53](https://github.com/mozrin/planets/issues/53) must move backups to encrypted off-host storage.

To restore a backup in development, stop the server, copy the selected backup over `planets.sqlite` inside the `server_data` volume, then start the stack. Always make a copy of the existing database first and perform a restore test in an isolated environment before relying on a backup.

## Local development with Traefik

The default `docker-compose.override.yaml` is loaded automatically. It is the development-only difference: it connects the `tunnel`, `server`, and `website` services to the pre-existing external `moznet` network and adds Traefik labels to the two application services. The local Cloudflared tunnel, using its local-development token, has exactly one ingress rule: `http://traefik:80`. Traefik then routes `/api` to `planets_server:3000` and all other paths to the website. Set `TRAEFIK_HOST=mozrin-planets.mozrin.com` in `.env`, then run:

```sh
docker network create moznet # only if your Traefik setup has not created it
docker compose up --build
```

Visit `https://mozrin-planets.mozrin.com`; the API is at `https://mozrin-planets.mozrin.com/api/health`. The local Cloudflared tunnel requires its local-development token in `.env` and forwards to Traefik.

## Configuration and secrets

The server validates numeric runtime configuration when it starts. The Compose stack refuses to start the tunnel without `CLOUDFLARED_TUNNEL_TOKEN`. Production configuration belongs in the deployment environment, not the repository or Docker image.

`mozrin-planets.mozrin.com` is the only local development host. Vite explicitly permits that host, and Traefik routes the API and website through it. The development Cloudflared token has no production authority, but production tokens are secrets and must be supplied through the deployment environment only.

## Operational health

- `/api/health/live` confirms the process can answer requests.
- `/api/health/ready` returns `200` only when the catalogue has synced successfully within two daily sync intervals; otherwise it returns `503` with sync age and error context.
- `/api/health` retains the compact compatibility status endpoint.

Server logs are JSON events suitable for container log collection. Investigate `catalogue.sync.failed` immediately; the catalogue remains on its last healthy data, and readiness becomes stale after 48 hours. Development monitoring can poll `/api/health/ready`; production alert routing belongs with the future deployment/monitoring configuration.

## Development conventions

- Run dependency commands from the repository root. This is an npm workspace monorepo, so `node_modules` belongs only at the root.
- Application source is TypeScript and TSX only; do not add JavaScript or JSX sources.
- Styling uses Tailwind CSS 4 utility classes only. `website/src/styles.css` is limited to the required Tailwind import.
- Local development is available at `https://mozrin-planets.mozrin.com`, not `localhost`.

Run the standard checks from the root:

```sh
npm run verify:conventions
npm run typecheck
npm run build
```

## Collaboration

Pull requests are for approved collaborators only. Read [CONTRIBUTING.md](CONTRIBUTING.md) before beginning work.

## Scientific methods and visualisation

The local catalogue's source choice, snapshot safeguards, freshness, and interpretation limits are documented in [catalogue data methods](docs/data/data-methods.md). Planet appearance work must follow the [planet rendering specifications](docs/science/planet-rendering-specifications.md) and [scientific visualization contract](docs/science/scientific-visualization-contract.md).

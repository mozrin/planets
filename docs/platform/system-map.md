# System map

The Planetary Atlas is a small TypeScript workspace with two deployable services. The browser never accesses the database or NASA directly.

```text
Browser
  └─ Cloudflared → Traefik (development) or private Docker network (production)
       ├─ /api → server:3000 → SQLite in server_data
       └─ /*   → website:3000

server startup and daily interval → NASA Exoplanet Archive PSCompPars
                              └─ validated snapshot → SQLite catalogue
```

## Repository map

| Location | Responsibility |
| --- | --- |
| `website/` | React 19 public, authentication, catalogue, and profile routes. |
| `server/` | Node HTTP API, authentication, SQLite schema, catalogue ingestion, backups, and health endpoints. |
| `docker/` | Service-specific production images. |
| `docs/` | Authored architecture, operations, data, science, quality, and design documentation. |
| `docker-compose.yaml` | Production-shaped local stack: website, server, Cloudflared, and durable named volumes. |
| `docker-compose.override.yaml` | Development-only Traefik routing and bind mounts. |

## Data and request boundaries

- `website` calls same-origin `/api`; its protected catalogue routes require a session.
- `server` owns the SQLite file, schema migrations, sessions, backups, and NASA retrieval. Do not access its data volume from the website.
- Cloudflared is the sole production ingress. Development traffic reaches Cloudflared, then Traefik, at `https://mozrin-planets.mozrin.com`.
- The root `package.json` and lockfile resolve workspace dependencies. Local source packages do not have their own `node_modules` directories.

For setup and operator actions, see [the README](../../README.md) and the [operations runbook](operations-runbook.md). For catalogue meaning and limits, see [data methods](../data/data-methods.md).

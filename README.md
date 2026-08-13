# The Planetary Atlas

A Node 24 monorepo for a scientist-first exoplanet research workspace.

## Layout

- `server/` — Node API service
- `website/` — mobile-first React 19 website
- `docs/design/` — English design documentation
- `docs/mpd/` — multilingual documentation, copied into the website at build time
- `docker/<service>/` — service-specific Dockerfiles

## Production deployment

1. Set `CLOUDFLARED_TUNNEL_TOKEN` in your deployment environment.
2. In Cloudflare Zero Trust, configure the `planets.mozrin.com` tunnel ingress rules: `^/api` to `http://planets_server:3000`, then `^/` to `http://planet_website:3000`.
3. Run `docker compose up -d --build`.

No host ports are published. The services share the private `planets_appnet` Docker network. Traefik is not part of the production stack. Cloudflared is the only inbound path and, using the deployed server's tunnel token, routes each request path directly to the relevant internal service.

## Local development with Traefik

The default `docker-compose.override.yaml` is loaded automatically. It is the development-only difference: it connects the `tunnel`, `server`, and `website` services to the pre-existing external `moznet` network and adds Traefik labels to the two application services. The local Cloudflared tunnel, using its local-development token, has exactly one ingress rule: `http://traefik:80`. Traefik then routes `/api` to `planets_server:3000` and all other paths to the website. Set `TRAEFIK_HOST=mozrin-planets.mozrin.com` in `.env`, then run:

```sh
docker network create moznet # only if your Traefik setup has not created it
docker compose up --build
```

Visit `https://mozrin-planets.mozrin.com`; the API is at `https://mozrin-planets.mozrin.com/api/health`. The local Cloudflared tunnel requires its local-development token in `.env` and forwards to Traefik.

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

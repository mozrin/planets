# Mozrin's Planet Dashboard

Node 24 monorepo for the API server and React 19 website.

## Layout

- `server/` — Node API service
- `website/` — mobile-first React 19 website
- `docs/design/` — English design documentation
- `docs/mpd/` — multilingual documentation, copied into the website at build time
- `docker/<service>/` — service-specific Dockerfiles

## Production deployment

1. Copy `.env.example` to `.env` and set `CLOUDFLARED_TUNNEL_TOKEN`.
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

## GitHub

When you are ready for the first remote push, initialize this directory as a Git repository and add `git@github.com:mozrin/planets_dashboard.git` (or the HTTPS equivalent).

# Base44 Setup Notes

This is a minimal static HTML site (single `index.html`).

## Running

```sh
docker compose -f docker-compose.base44.yml up -d
```

- Served by nginx:alpine on host port 3000.
- Source is bind-mounted at `/usr/share/nginx/html` (read-only); edits to `index.html` appear on refresh.
- No backend, no database, no external credentials needed.

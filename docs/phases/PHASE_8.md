# Phase 8 — Dockerization

## Files

```
docker/
├── docker-compose.yml       # MySQL + Redis + backend + frontend
├── docker-compose.prod.yml  # Adds Nginx reverse proxy
├── .env.example
├── backend/
│   ├── Dockerfile
│   └── entrypoint.sh        # wait DB → migrate → collectstatic → gunicorn
├── frontend/
│   └── Dockerfile           # Next.js standalone multi-stage build
└── nginx/
    └── default.conf         # Compose Nginx routing

backend/config/settings/docker.py   # Production settings for containers
nginx/job-board.conf                # EC2 Nginx template (Phase 10)
```

## Quick start

```bash
cd ~/Projects/job-board/docker
cp .env.example .env
# Edit DJANGO_SECRET_KEY in .env

docker compose up --build
```

| Service | URL |
|---------|-----|
| API | http://localhost:8000/api/v1/ |
| Swagger | http://localhost:8000/api/docs/ |
| Frontend | http://localhost:3000 |
| MySQL | localhost:3306 |
| Redis | localhost:6379 |

## With Nginx (single port 80)

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build
# App → http://localhost (Nginx proxies /api → Django, / → Next.js)
```

## Commands

```bash
# Detached
docker compose up -d --build

# Logs
docker compose logs -f backend

# Shell into backend
docker compose exec backend sh

# Run management commands
docker compose exec backend python manage.py createsuperuser

# Stop and remove containers
docker compose down

# Stop and remove volumes (wipes DB)
docker compose down -v
```

## How the backend container starts

1. **Wait** for MySQL (healthcheck + connection retry)
2. **`migrate`** — apply Django migrations
3. **`collectstatic`** — gather admin/static files to volume
4. **Gunicorn** — 3 workers on `:8000`

## Environment variables

See `docker/.env.example`. Key values:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Auto-set to `db` host in compose |
| `REDIS_URL` | Auto-set to `redis` host |
| `DJANGO_SETTINGS_MODULE` | `config.settings.docker` |
| `NEXT_PUBLIC_API_URL` | Browser-facing API URL for Next.js build |

## Production notes

- Set a strong `DJANGO_SECRET_KEY`
- Use `docker-compose.prod.yml` + TLS (Certbot on EC2, Phase 10)
- Pin image tags in production (`mysql:8.0.36`, etc.)
- Do not expose MySQL/Redis ports publicly on EC2

## Next phase

Phase 9 — GitHub Actions CI/CD pipeline.

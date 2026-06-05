# Deployment Guide

## Frontend — Vercel (recommended for Next.js)

The frontend lives in `frontend/`. Deploy it as a separate Vercel project with the **Root Directory** set to `frontend`.

### Steps

1. Push the repository to GitHub.
2. In [Vercel](https://vercel.com), **Add New Project** → import the repo.
3. Set **Root Directory** to `frontend`.
4. Add environment variable:
   - `NEXT_PUBLIC_API_URL` — your production API base URL, e.g. `https://api.yourdomain.com/api/v1`
5. Deploy.

Vercel auto-detects Next.js. `frontend/vercel.json` pins the build/install commands.

### Backend CORS

Add your Vercel URL to the Django backend:

```env
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app,https://your-custom-domain.com
```

Redeploy or restart the backend after updating CORS.

### Preview deployments

Set `NEXT_PUBLIC_API_URL` in Vercel **Preview** environment to a staging API, or the same production API if previews should hit prod.

---

## Full stack — Docker (local / EC2)

```bash
cd docker
cp .env.example .env   # set DJANGO_SECRET_KEY
docker compose up --build
```

| Service | URL |
|---------|-----|
| API | http://localhost:8000/api/v1/ |
| Swagger | http://localhost:8000/api/docs/ |
| Frontend | http://localhost:3000 |

With Nginx on port 80:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build
```

---

## Target production environment (EC2)

- **AWS EC2** (Ubuntu 22.04) — application host
- **MySQL 8** — RDS or self-managed on EC2
- **Redis 7** — ElastiCache or EC2
- **Nginx** — TLS termination, static files, reverse proxy
- **Gunicorn** — Django WSGI
- **Vercel** — Next.js frontend (or PM2/systemd on EC2)

### High-level EC2 steps

1. Provision EC2, security groups (22, 80, 443).
2. Install Docker OR Python 3.12 + Node 20 + Nginx.
3. Clone repository; set `backend/.env` and production env vars.
4. Run migrations: `python manage.py migrate`
5. Collect static: `python manage.py collectstatic`
6. Configure Nginx (`nginx/job-board.conf`).
7. Enable HTTPS with Certbot.
8. Set GitHub Actions secrets for deploy pipeline (optional).

## Environment variables (production)

See `backend/.env.example`, `frontend/.env.example`, and `docker/.env.example`.

Critical backend vars:

- `DJANGO_SECRET_KEY`
- `DATABASE_URL` or `DB_*` vars
- `REDIS_URL`
- `ALLOWED_HOSTS`
- `CORS_ALLOWED_ORIGINS`

Critical frontend vars:

- `NEXT_PUBLIC_API_URL`

## Health checks

- `GET /api/v1/health/` — API liveness
- Nginx: `proxy_pass` to Gunicorn upstream

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on push/PR:

- Backend: Django check, migrations, OpenAPI schema validation
- Frontend: ESLint + production build

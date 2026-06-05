# Deployment Guide

> **Note:** Full Docker, CI/CD, and EC2 steps are completed in Phases 8–10. This document outlines the target production setup.

## Target environment

- **AWS EC2** (Ubuntu 22.04) — application host
- **MySQL 8** — RDS or self-managed on EC2
- **Redis 7** — ElastiCache or EC2
- **Nginx** — TLS termination, static files, reverse proxy
- **Gunicorn** — Django WSGI
- **PM2 or systemd** — Next.js production server (or static export behind Nginx)

## High-level steps

1. Provision EC2, security groups (22, 80, 443).
2. Install Docker OR Python 3.12 + Node 20 + Nginx.
3. Clone repository; set `backend/.env` and `frontend/.env.production`.
4. Run migrations: `python manage.py migrate`
5. Collect static: `python manage.py collectstatic`
6. Build frontend: `npm run build`
7. Configure Nginx (`nginx/job-board.conf`).
8. Enable HTTPS with Certbot.
9. Set GitHub Actions secrets for deploy pipeline.

## Environment variables (production)

See `backend/.env.example` and `frontend/.env.example`.

Critical:

- `DJANGO_SECRET_KEY`
- `DATABASE_URL` or `DB_*` vars
- `REDIS_URL`
- `ALLOWED_HOSTS`
- `CORS_ALLOWED_ORIGINS`

## Health checks

- `GET /api/v1/health/` — API liveness (added in backend)
- Nginx: `proxy_pass` to Gunicorn upstream

Detailed commands and `docker-compose.prod.yml` are added in Phase 8–10.

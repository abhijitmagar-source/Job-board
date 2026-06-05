# Job Board — Full-Stack Portfolio Project

A production-style job board showcasing **Django**, **Django REST Framework**, **MySQL**, **Redis**, **JWT**, **RBAC**, **Next.js**, **Docker**, **GitHub Actions**, and **AWS EC2** deployment.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | Django 5, Django REST Framework |
| Database | MySQL 8 |
| Cache | Redis 7 |
| Auth | JWT (Simple JWT) |
| API Docs | drf-spectacular (OpenAPI / Swagger) |
| DevOps | Docker, Docker Compose, Nginx, GitHub Actions |

## Repository Structure

```
job-board/
├── backend/                 # Django API
│   ├── config/              # Project settings & URLs
│   ├── apps/                # Domain apps
│   │   ├── accounts/        # User, Profile, JWT auth
│   │   ├── companies/       # Company model
│   │   ├── jobs/            # Job listings, saved jobs
│   │   └── applications/    # Job applications
│   └── requirements/        # Split dependency files
├── frontend/                # Next.js UI
├── docker/                  # Dockerfiles & compose
├── nginx/                   # Reverse proxy config
├── docs/                    # Architecture & guides
├── scripts/                 # Helper scripts
└── .github/workflows/       # CI/CD
```

## Roles

1. **Recruiter** — CRUD jobs, view applicants, update application status
2. **Job Seeker** — Browse/search/filter jobs, apply, save jobs, view applications

## Quick Start (Docker — recommended)

```bash
cd docker
cp .env.example .env          # set DJANGO_SECRET_KEY
docker compose up --build

# API:        http://localhost:8000/api/v1/
# Swagger UI: http://localhost:8000/api/docs/
# Frontend:   http://localhost:3000
```

Browse jobs at http://localhost:3000/jobs — search, filter, apply, and manage listings from the UI.

## Deploy frontend to Vercel

1. Import the repo in Vercel with **Root Directory** = `frontend`
2. Set `NEXT_PUBLIC_API_URL` to your production API
3. Add the Vercel URL to backend `CORS_ALLOWED_ORIGINS`

See [Deployment Guide](docs/DEPLOYMENT.md) for full details.

With Nginx on port 80:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build
```

## Local development (without Docker)

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
./scripts/setup-dev.sh
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)
- [API Overview](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Phase 9: CI/CD](docs/phases/PHASE_9.md)

## Development Phases

| Phase | Topic |
|-------|--------|
| 1 | System design & folder structure |
| 2 | Database models |
| 3 | JWT authentication |
| 4 | Job management APIs |
| 5 | Application management APIs |
| 6 | Redis caching |
| 7 | Swagger documentation |
| 8 | Dockerization |
| 9 | GitHub Actions CI/CD |
| 10 | Deployment (Vercel + EC2) |

## License

MIT — portfolio / learning use.

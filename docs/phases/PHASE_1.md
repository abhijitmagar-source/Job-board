# Phase 1 — System Design & Folder Structure

## Goals

- Define monorepo layout for backend, frontend, DevOps, and docs
- Document architecture, database design, and API contract
- Scaffold Django project and Next.js app (no business logic yet)

## Folder structure explained

### `backend/`

| Path | Purpose |
|------|---------|
| `config/settings/` | Split settings: `base`, `development`, `production` |
| `config/urls.py` | Root routes (admin, API, Swagger) |
| `config/api_urls.py` | Versioned `/api/v1/` router |
| `apps/accounts/` | Users, profiles, JWT (Phase 3) |
| `apps/companies/` | Company entity |
| `apps/jobs/` | Jobs + saved jobs |
| `apps/applications/` | Applications + status |
| `requirements/` | `base.txt`, `dev.txt`, `prod.txt` |

### `frontend/`

| Path | Purpose |
|------|---------|
| `src/app/` | Next.js App Router pages |
| `src/components/` | Reusable UI |
| `src/lib/api.ts` | HTTP client to Django |
| `src/types/` | TS types matching API |

### `docs/`

Architecture, schema, API overview, deployment outline.

### `docker/`, `nginx/`, `.github/workflows/`

Filled in Phases 8–9.

## Commands

```bash
# Clone / enter project
cd ~/Projects/job-board

# Optional: run setup script (installs deps)
chmod +x scripts/setup-dev.sh
./scripts/setup-dev.sh

# Backend (after Phase 2 — migrations need User model)
cd backend
source .venv/bin/activate
cp .env.example .env
# python manage.py migrate
# python manage.py runserver

# Frontend
cd frontend
npm install
npm run dev
# Open http://localhost:3000
```

## Design decisions

1. **Monorepo** — one Git repo; CI can test both stacks.
2. **Apps per domain** — easier RBAC and testing than one giant `api` app.
3. **Settings split** — safe production defaults without touching dev config.
4. **API versioning** — `/api/v1/` allows future breaking changes.
5. **JWT + blacklist** — stateless API with secure logout.

## What’s next (Phase 2)

Implement `User`, `Profile`, `Company`, `Job`, `Application`, `SavedJob` models, migrations, and Django admin.

## Verification (Phase 1 only)

```bash
tree -L 3 ~/Projects/job-board   # inspect structure
ls docs/                         # ARCHITECTURE, DATABASE_SCHEMA, API
```

Django `runserver` will work fully after Phase 2 creates `accounts.User`.

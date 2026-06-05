# Phase 9 — GitHub Actions CI/CD

## Workflow

File: `.github/workflows/ci.yml`

Triggers on push and pull request to `main` / `master`.

### Backend job

- **Services:** MySQL 8, Redis 7
- **Steps:**
  1. Python 3.12 + pip cache
  2. Install `requirements/dev.txt`
  3. `python manage.py check`
  4. `python manage.py migrate --noinput`
  5. `python manage.py spectacular --validate` (OpenAPI schema)

### Frontend job

- **Steps:**
  1. Node 20 + npm cache
  2. `npm ci` in `frontend/`
  3. `npm run lint`
  4. `npm run build` with `NEXT_PUBLIC_API_URL` set

## Local verification

```bash
# Backend (requires MySQL + Redis or dev settings)
cd backend && source .venv/bin/activate
python manage.py check
python manage.py migrate
python manage.py spectacular --file /tmp/schema.yaml --validate

# Frontend
cd frontend
npm ci && npm run lint && npm run build
```

## Next phase

Phase 10 — Production deployment (Vercel frontend + EC2/Docker backend). See [DEPLOYMENT.md](../DEPLOYMENT.md).

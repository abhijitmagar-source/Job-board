# Job Board API (Django)

REST API for the Job Board platform. Built with Django 5, Django REST Framework, and SimpleJWT.

## Quick start

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements/dev.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver
```

API docs: http://localhost:8000/api/docs/

## Settings modules

| Module | Use case |
|--------|----------|
| `config.settings.development` | Local dev (SQLite, LocMem cache) |
| `config.settings.production` | Render (PostgreSQL, optional Redis) |
| `config.settings.docker` | Docker Compose |
| `config.settings.ci` | GitHub Actions |

## Key endpoints

- `POST /api/v1/auth/register/` — Register (candidate/recruiter)
- `POST /api/v1/auth/login/` — JWT login
- `GET /api/v1/jobs/` — Browse, search, filter jobs
- `POST /api/v1/applications/` — Apply for a job
- `GET /api/v1/jobs/{id}/applicants/` — Recruiter applicant list
- `GET /api/v1/auth/admin/` — Admin management APIs

## Tests

```bash
pytest
```

## Production (Render)

Set `DJANGO_SETTINGS_MODULE=config.settings.production` and configure:

- `DATABASE_URL` (auto from Render PostgreSQL)
- `ALLOWED_HOSTS`
- `CORS_ALLOWED_ORIGINS`
- `CLOUDINARY_*` (required for file uploads on ephemeral disks)

See root [README.md](../README.md) for full deployment guide.

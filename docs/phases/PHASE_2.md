# Phase 2 — Database Models

## Models implemented

| Model | App | Table |
|-------|-----|-------|
| `User` | accounts | `accounts_user` |
| `Profile` | accounts | `accounts_profile` |
| `Company` | companies | `companies_company` |
| `Job` | jobs | `jobs_job` |
| `Application` | applications | `applications_application` |
| `SavedJob` | jobs | `jobs_savedjob` |

## Highlights

- **Custom User** — email login, `role` (`recruiter` | `job_seeker`)
- **Unique constraints** — one application per job per user; one saved job per user per job
- **Indexes** — `is_active` + `created_at` on jobs; `job` + `status` on applications
- **Admin** — all models registered with useful `list_display` / filters

## Commands

```bash
cd backend
source .venv/bin/activate
cp .env.example .env   # set DATABASE_URL for MySQL in production

# MySQL (Docker or local)
# DATABASE_URL=mysql://jobboard:jobboard@127.0.0.1:3306/jobboard

# Quick local SQLite (optional)
export DATABASE_URL=sqlite:///db.sqlite3

python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser

# Django admin
python manage.py runserver
# http://127.0.0.1:8000/admin/
```

## MySQL setup (example)

```sql
CREATE DATABASE jobboard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'jobboard'@'%' IDENTIFIED BY 'jobboard';
GRANT ALL PRIVILEGES ON jobboard.* TO 'jobboard'@'%';
FLUSH PRIVILEGES;
```

## Next phase

Phase 3 adds JWT register, login, refresh, logout and profile endpoints.

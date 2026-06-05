# Phase 3 — JWT Authentication

## Endpoints

Base: `/api/v1/auth/`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `register/` | No | Create account + return tokens |
| POST | `login/` | No | Email/password → JWT |
| POST | `refresh/` | No | Refresh token → new access |
| POST | `logout/` | Bearer | Blacklist refresh token |
| GET | `me/` | Bearer | Current user + profile |
| GET/PATCH | `profile/me/` | Bearer | Update profile |

## Request examples

### Register

```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seeker@example.com",
    "password": "SecurePass123!",
    "password_confirm": "SecurePass123!",
    "role": "job_seeker",
    "full_name": "Jane Doe"
  }'
```

### Login

```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "seeker@example.com", "password": "SecurePass123!"}'
```

### Refresh

```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/refresh/ \
  -H "Content-Type: application/json" \
  -d '{"refresh": "<refresh_token>"}'
```

### Logout

```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/logout/ \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"refresh": "<refresh_token>"}'
```

### Profile

```bash
curl http://127.0.0.1:8000/api/v1/auth/profile/me/ \
  -H "Authorization: Bearer <access_token>"
```

## Files added

```
apps/accounts/
├── serializers.py    # Register, login, profile, logout
├── views.py          # Register, Login, Refresh, Logout, Profile
├── urls.py           # Auth routes
└── permissions.py    # IsRecruiter, IsJobSeeker (used in Phases 4–5)
```

## Security features

- Password validators (Django defaults)
- JWT access (30 min) + refresh (7 days)
- Refresh rotation + blacklist on logout
- Auth endpoints rate-limited (`20/minute` per scope `auth`)
- Role embedded in JWT claims (`email`, `role`)

## Setup commands

```bash
cd backend
source .venv/bin/activate
export DATABASE_URL=sqlite:///db.sqlite3   # or MySQL URL

python manage.py migrate                   # includes token_blacklist tables
python manage.py runserver
```

## Next phase

Phase 4 — Job & company CRUD, listing with search/filter/sort for job seekers.

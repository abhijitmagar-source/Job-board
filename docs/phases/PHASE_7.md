# Phase 7 — Swagger / OpenAPI Documentation

## Interactive docs

| URL | UI |
|-----|-----|
| http://127.0.0.1:8000/api/docs/ | **Swagger UI** (try endpoints) |
| http://127.0.0.1:8000/api/redoc/ | **ReDoc** (readable reference) |
| http://127.0.0.1:8000/api/schema/ | Raw OpenAPI 3 JSON |

## Authenticate in Swagger UI

1. `POST /api/v1/auth/login/` with email + password
2. Copy the `access` token from the response
3. Click **Authorize** (top right)
4. Enter: `Bearer <paste_access_token>`
5. Call protected endpoints

## What was added

```
config/
├── schema.py       # Reusable request examples
├── views.py        # Documented health check
└── settings/base.py  # SPECTACULAR_SETTINGS (tags, JWT, enums)

scripts/export-openapi.sh   # Export static schema YAML
docs/openapi/schema.yaml    # Generated OpenAPI file (run script)
```

## Schema features

- **Tagged groups:** Health, Auth, Profiles, Companies, Jobs, Saved Jobs, Applications
- **JWT Bearer** security scheme with `persistAuthorization`
- **Enum docs** for roles, job types, experience levels, application statuses
- **Request examples** on register, login, create job, apply, status update
- **Per-endpoint auth** — public routes marked `auth=[]` (no lock icon)

## Export static schema

```bash
chmod +x scripts/export-openapi.sh
./scripts/export-openapi.sh
```

Or manually:

```bash
cd backend
source .venv/bin/activate
python manage.py spectacular --file ../docs/openapi/schema.yaml --validate
```

## Validate schema in CI (Phase 9)

```bash
python manage.py spectacular --validate --fail-on-warn
```

## Next phase

Phase 8 — Dockerization (Dockerfile + Docker Compose).

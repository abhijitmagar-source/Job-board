# API Documentation (Overview)

Base URL: `/api/v1/`

## Interactive documentation

| URL | Description |
|-----|-------------|
| `/api/docs/` | Swagger UI — try endpoints in the browser |
| `/api/redoc/` | ReDoc — readable API reference |
| `/api/schema/` | OpenAPI 3.0 JSON schema |

**Swagger auth:** Login via `POST /api/v1/auth/login/`, then **Authorize** with `Bearer <access_token>`.

## Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register/` | Register (role in body) | No |
| POST | `/auth/login/` | Obtain access + refresh | No |
| POST | `/auth/refresh/` | Refresh access token | Refresh token |
| POST | `/auth/logout/` | Blacklist refresh token | Yes |
| GET | `/auth/me/` | Current user + profile | Bearer |
| GET/PATCH | `/auth/profile/me/` | View/update profile | Bearer |

### Register body (example)

```json
{
  "email": "seeker@example.com",
  "password": "SecurePass123!",
  "password_confirm": "SecurePass123!",
  "role": "job_seeker",
  "full_name": "Jane Doe"
}
```

## Jobs (public read, recruiter write)

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/jobs/` | Any | List active jobs (paginated, filter, search, sort) |
| GET | `/jobs/?mine=1` | Recruiter | Own jobs (incl. inactive) |
| GET | `/jobs/{id}/` | Any | Detail (recruiter poster can view inactive) |
| POST | `/jobs/` | Recruiter | Create |
| PATCH | `/jobs/{id}/` | Recruiter (poster) | Update |
| DELETE | `/jobs/{id}/` | Recruiter (poster) | Soft-delete (`is_active=false`) |

### Query parameters (list)

- `search` — title, description, company name, location
- `location`, `job_type`, `experience_level`, `company`
- `salary_min`, `salary_max`
- `ordering` — `created_at`, `-salary`, `title`
- `page`, `page_size`

## Saved jobs (job seeker)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/saved-jobs/` | List saved |
| POST | `/saved-jobs/` | Save `{ "job_id": 1 }` |
| DELETE | `/saved-jobs/{id}/` | Unsave |

## Companies

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/companies/` | Any | List |
| GET | `/companies/?mine=1` | Recruiter | Own companies |
| POST | `/companies/` | Recruiter | Create |
| PATCH | `/companies/{id}/` | Owner | Update |
| DELETE | `/companies/{id}/` | Owner | Delete |

## Applications

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/applications/` | Job seeker | Apply `{ "job_id": 1, "cover_letter": "..." }` |
| GET | `/applications/me/` | Job seeker | My applications (`?status=`, `?job=`) |
| GET | `/jobs/{job_id}/applicants/` | Recruiter (poster) | Applicants with profile |
| PATCH | `/applications/{id}/status/` | Recruiter (poster) | Update status |

### Application statuses

`pending`, `reviewed`, `shortlisted`, `rejected`, `hired`

## Profiles

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/PATCH | `/auth/profile/me/` | Current user profile |

## Standard responses

- **200** — Success
- **201** — Created
- **400** — Validation error
- **401** — Unauthorized
- **403** — Forbidden (wrong role)
- **404** — Not found
- **429** — Rate limit exceeded

## Rate limits (default)

- Anonymous: 100/hour
- Authenticated: 1000/hour

(Final values configured in Django settings.)

# Phase 4 — Job Management APIs

## Endpoints

### Companies (`/api/v1/companies/`)

| Method | Auth | Role | Description |
|--------|------|------|-------------|
| GET | Optional | Any | List companies |
| GET `?mine=1` | Bearer | Recruiter | Own companies |
| GET `/{id}/` | Optional | Any | Company detail |
| POST | Bearer | Recruiter | Create company |
| PATCH/PUT `/{id}/` | Bearer | Owner | Update |
| DELETE `/{id}/` | Bearer | Owner | Delete |

### Jobs (`/api/v1/jobs/`)

| Method | Auth | Role | Description |
|--------|------|------|-------------|
| GET | Optional | Any | Browse active jobs |
| GET `?mine=1` | Bearer | Recruiter | Own jobs (incl. inactive) |
| GET `/{id}/` | Optional | Any | Job detail |
| POST | Bearer | Recruiter | Create job |
| PATCH/PUT `/{id}/` | Bearer | Poster | Update |
| DELETE `/{id}/` | Bearer | Poster | Soft-delete (`is_active=false`) |

### Saved jobs (`/api/v1/saved-jobs/`)

| Method | Auth | Role | Description |
|--------|------|------|-------------|
| GET | Bearer | Job seeker | List saved |
| POST | Bearer | Job seeker | Save `{ "job_id": 1 }` |
| DELETE `/{id}/` | Bearer | Job seeker | Unsave |

## Query parameters (jobs list)

| Param | Example | Description |
|-------|---------|-------------|
| `search` | `python` | Title, description, company, location |
| `location` | `London` | Partial match |
| `job_type` | `remote` | Exact |
| `experience_level` | `senior` | Exact |
| `company` | `3` | Company ID |
| `salary_min` | `50000` | Minimum salary |
| `salary_max` | `120000` | Maximum salary |
| `ordering` | `-salary` | `created_at`, `salary`, `title` |
| `page` | `2` | Pagination |

## Example flow

```bash
# 1. Register recruiter & login → get TOKEN

# 2. Create company
curl -X POST http://127.0.0.1:8000/api/v1/companies/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Acme Corp", "website": "https://acme.com", "description": "We hire."}'

# 3. Post a job
curl -X POST http://127.0.0.1:8000/api/v1/jobs/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Python Developer",
    "description": "Django + DRF experience required.",
    "salary": "95000.00",
    "location": "Remote",
    "job_type": "remote",
    "experience_level": "senior",
    "company_id": 1
  }'

# 4. Browse (public)
curl "http://127.0.0.1:8000/api/v1/jobs/?search=python&job_type=remote&ordering=-salary"

# 5. Job seeker saves a job
curl -X POST http://127.0.0.1:8000/api/v1/saved-jobs/ \
  -H "Authorization: Bearer $SEEKER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"job_id": 1}'
```

## Files added

```
apps/companies/
├── serializers.py
├── views.py          # CompanyViewSet
├── urls.py
└── permissions.py    # IsCompanyOwner

apps/jobs/
├── serializers.py
├── views.py          # JobViewSet, SavedJobViewSet
├── urls.py
├── filters.py        # JobFilter
└── permissions.py    # IsJobOwner, IsSavedJobOwner
```

## Optimizations

- `select_related("company", "posted_by")` on job queries
- `Exists` subquery annotation for `is_saved` (no N+1)
- Soft delete preserves application history (Phase 5)

## Next phase

Phase 5 — Apply for jobs, view applicants, update application status.

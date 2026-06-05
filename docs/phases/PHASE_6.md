# Phase 6 — Redis Caching

## What is cached

| Endpoint | Cached? | Notes |
|----------|---------|-------|
| `GET /api/v1/jobs/` | Yes | Public browse + job seeker lists |
| `GET /api/v1/jobs/?mine=1` | No | Recruiter-specific |
| `GET /api/v1/jobs/{id}/` | No | Detail always fresh (Phase 6 scope) |
| Writes (POST/PATCH/DELETE job) | — | Invalidates list cache |

## How it works

1. **Cache key** = `jobs:list:v{version}:{segment}:{query_hash}`
   - `segment` = `public` (anonymous/recruiter browse) or `seeker:{user_id}`
   - `query_hash` = SHA-256 of sorted query params (search, filters, page, ordering)

2. **TTL** — `JOBS_LIST_CACHE_TTL` (default 300 seconds / 5 minutes)

3. **Invalidation** — version counter `jobs:list:version` is incremented on:
   - Job create / update / soft-delete (API)
   - Job save/delete via Django admin (signal)

   Old keys are not deleted; they simply stop matching the new version prefix.

## Files

```
apps/jobs/
├── cache.py      # Key building, get/set, invalidate
├── signals.py    # Admin / ORM cache bust
└── views.py      # list() cache read-through; write invalidation
```

## Configuration

```env
# backend/.env
REDIS_URL=redis://127.0.0.1:6379/1
JOBS_LIST_CACHE_TTL=300
```

Production uses `django-redis` (`config/settings/base.py`).  
Local dev defaults to LocMem (`development.py`) — same code path, no Redis required.

### Test with Redis locally

```bash
docker run -d --name jobboard-redis -p 6379:6379 redis:7-alpine

# In backend/.env
REDIS_URL=redis://127.0.0.1:6379/1

# Comment out CACHES override in config/settings/development.py
```

## Verify caching

```bash
# First request — hits database
curl -s -o /dev/null -w "%{time_total}\n" "http://127.0.0.1:8000/api/v1/jobs/"

# Second request — served from cache (faster)
curl -s -o /dev/null -w "%{time_total}\n" "http://127.0.0.1:8000/api/v1/jobs/"

# Create/update/delete a job → cache invalidated automatically
```

Inspect Redis keys (production):

```bash
redis-cli KEYS "jobboard:jobs:list:*"
redis-cli GET jobboard:jobs:list:version
```

## Next phase

Phase 7 — Swagger / OpenAPI documentation polish.

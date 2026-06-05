# Phase 5 — Application Management APIs

## Endpoints

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/applications/` | Job seeker | Apply for a job |
| GET | `/applications/me/` | Job seeker | List own applications |
| GET | `/jobs/{job_id}/applicants/` | Recruiter (poster) | View applicants |
| PATCH | `/applications/{id}/status/` | Recruiter (poster) | Update status |

## Application statuses

`pending` → `reviewed` → `shortlisted` → `hired`  
Any status can move to `rejected`.

## Request examples

### Apply

```bash
curl -X POST http://127.0.0.1:8000/api/v1/applications/ \
  -H "Authorization: Bearer $SEEKER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"job_id": 1, "cover_letter": "I have 5 years of Django experience."}'
```

### My applications

```bash
curl "http://127.0.0.1:8000/api/v1/applications/me/?status=pending" \
  -H "Authorization: Bearer $SEEKER_TOKEN"
```

### View applicants (recruiter)

```bash
curl http://127.0.0.1:8000/api/v1/jobs/1/applicants/ \
  -H "Authorization: Bearer $RECRUITER_TOKEN"
```

### Update status

```bash
curl -X PATCH http://127.0.0.1:8000/api/v1/applications/1/status/ \
  -H "Authorization: Bearer $RECRUITER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "shortlisted"}'
```

## Files added

```
apps/applications/
├── serializers.py    # Apply, list, applicant, status update
├── views.py          # Apply, me, applicants, status
├── urls.py
└── permissions.py    # IsJobPoster
```

## Business rules

- Only **active** jobs accept applications
- One application per job per user (DB unique constraint)
- Only the **recruiter who posted** the job can view applicants and change status
- Applicant list includes profile (name, resume URL, bio)

## Optimizations

- `select_related("job", "job__company")` on seeker applications
- `select_related("applicant", "applicant__profile")` on recruiter applicant list

## Next phase

Phase 6 — Redis caching on job listing endpoints.

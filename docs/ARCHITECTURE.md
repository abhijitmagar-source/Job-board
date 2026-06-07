# System Architecture

## Overview

The Job Board is a **monorepo** with a decoupled **REST API** (Django) and **Next.js frontend**. Clients authenticate with **JWT**; the API enforces **role-based permissions** for Candidates, Recruiters, and Admins.

## Deployment Architecture

```
┌─────────────────────────────────────────────────┐
│                 User's Browser                   │
└──────────────────────┬──────────────────────────┘
                       │
           ┌───────────▼───────────┐
           │   Next.js Frontend    │  ← Vercel
           │  (React / App Router) │     https://job-board-eight-henna.vercel.app
           └───────────┬───────────┘
                       │ REST API (JWT Bearer)
           ┌───────────▼───────────┐
           │   Django REST API     │  ← Render
           │  (DRF + Gunicorn)     │     https://job-board-gfnq.onrender.com
           └───────────┬───────────┘
                       │
           ┌───────────▼───────────┐
           │    PostgreSQL DB      │  ← Render PostgreSQL
           └───────────────────────┘
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | Django 5, Django REST Framework |
| Database | PostgreSQL (Render) |
| Auth | JWT via SimpleJWT (access + refresh tokens) |
| File Storage | Cloudinary |
| API Docs | drf-spectacular (Swagger / ReDoc) |
| Frontend Deploy | Vercel |
| Backend Deploy | Render |
| CI/CD | GitHub Actions |

## Backend Architecture

### Layered design

```
HTTP Request
    → URL routing (config/urls.py → api/v1/)
    → DRF View / ViewSet
    → Serializer (validation + representation)
    → Permission classes (RBAC)
    → ORM queryset
    → Response
```

### Django Apps

| App | Responsibility |
|---|---|
| `accounts` | User model, auth, profiles, dashboard |
| `companies` | Company management (recruiter owned) |
| `jobs` | Job CRUD, search, filter, saved jobs |
| `applications` | Apply, track, status updates |

### Settings

- `config/settings/base.py` — shared config
- `config/settings/development.py` — local dev
- `config/settings/production.py` — production (Render)

## Frontend Architecture

```
src/
├── app/          # Next.js App Router pages
├── components/   # Reusable UI components
├── lib/          # API client (axios + JWT refresh)
├── context/      # Auth context
└── types/        # TypeScript interfaces
```

## Security

- JWT access + refresh tokens
- Refresh token blacklisting on logout
- Role-based permissions: `IsCandidate`, `IsRecruiter`, `IsAdmin`
- Object-level: recruiters can only edit their own jobs
- CORS restricted to Vercel frontend domain
- HTTPS enforced on both Vercel and Render

## CI/CD Flow

```
Push to main (GitHub)
       │
       ├── GitHub Actions CI
       │     ├── Backend: Django checks + migrations
       │     └── Frontend: ESLint + next build
       │
       ├── Vercel → auto deploys frontend
       └── Render → auto deploys backend
```

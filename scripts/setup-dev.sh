#!/usr/bin/env bash
# Local development bootstrap (run from repo root)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "==> Backend virtualenv"
cd "$ROOT/backend"
python3 -m venv .venv
source .venv/bin/activate
pip install -U pip
pip install -r requirements/dev.txt

if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "Created backend/.env — update DJANGO_SECRET_KEY and DATABASE_URL"
fi

echo "==> Frontend dependencies"
cd "$ROOT/frontend"
npm install
if [[ ! -f .env.local ]]; then
  cp .env.example .env.local
fi

echo ""
echo "Done. Next steps (after Phase 2 models):"
echo "  cd backend && source .venv/bin/activate && python manage.py migrate"
echo "  python manage.py runserver"
echo "  cd frontend && npm run dev"

#!/usr/bin/env bash
# Export OpenAPI schema to docs/openapi/schema.yaml
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/docs/openapi/schema.yaml"

mkdir -p "$(dirname "$OUT")"
cd "$ROOT/backend"
source .venv/bin/activate 2>/dev/null || true

export DJANGO_SETTINGS_MODULE=config.settings.development
export DATABASE_URL="${DATABASE_URL:-sqlite:///db.sqlite3}"

python manage.py spectacular --file "$OUT" --validate
echo "OpenAPI schema written to $OUT"

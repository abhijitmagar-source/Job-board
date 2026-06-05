#!/usr/bin/env sh
set -eu

: "${DJANGO_SETTINGS_MODULE:=config.settings.docker}"

echo "==> Waiting for database..."
python <<'PY'
import os
import sys
import time

os.environ.setdefault("DJANGO_SETTINGS_MODULE", os.environ.get("DJANGO_SETTINGS_MODULE", "config.settings.docker"))

max_attempts = 30
for attempt in range(1, max_attempts + 1):
    try:
        import django

        django.setup()
        from django.db import connection

        connection.ensure_connection()
        print("Database is ready.")
        sys.exit(0)
    except Exception as exc:
        print(f"Attempt {attempt}/{max_attempts}: database not ready ({exc})")
        time.sleep(2)

print("Database connection failed after maximum retries.")
sys.exit(1)
PY

echo "==> Running migrations..."
python manage.py migrate --noinput

echo "==> Collecting static files..."
python manage.py collectstatic --noinput

echo "==> Starting application..."
exec "$@"

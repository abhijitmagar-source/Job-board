"""Local development settings."""
from .base import *  # noqa: F403

DEBUG = True
ALLOWED_HOSTS = ["localhost", "127.0.0.1", "testserver"]

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# LocMem cache for local dev without Redis. Cache logic is identical to production.
# To test with Redis locally: comment this block and set REDIS_URL in .env
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "jobboard-dev",
    }
}

# Optional: use SQLite for quick local bootstrap without MySQL
# Uncomment if you want zero-MySQL local dev before Docker:
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

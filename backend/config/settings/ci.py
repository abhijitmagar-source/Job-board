"""GitHub Actions CI — PostgreSQL + in-memory cache."""
from .base import *  # noqa: F403

DEBUG = True

# --- Database (PostgreSQL for CI) ---
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "jobboard_test",
        "USER": "postgres",
        "PASSWORD": "postgres",
        "HOST": "127.0.0.1",
        "PORT": "5432",
    }
}

# --- Cache (no Redis needed in CI) ---
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "jobboard-ci",
    }
}
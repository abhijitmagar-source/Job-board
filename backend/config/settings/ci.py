"""GitHub Actions CI — PostgreSQL + in-memory cache."""
from .base import *  # noqa: F403

DEBUG = True

# --------------------
# DATABASE (PostgreSQL CI)
# --------------------
import environ

env = environ.Env()

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": env("POSTGRES_DB", default="jobboard_test"),
        "USER": env("POSTGRES_USER", default="postgres"),
        "PASSWORD": env("POSTGRES_PASSWORD", default="postgres"),
        "HOST": env("POSTGRES_HOST", default="127.0.0.1"),
        "PORT": env("POSTGRES_PORT", default="5432"),
    }
}

# --------------------
# CACHE (no Redis required for tests)
# --------------------
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "jobboard-ci",
    }
}
"""GitHub Actions CI — MySQL/Redis services with in-memory cache fallback."""
from .docker import *  # noqa: F403

DEBUG = True

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "jobboard-ci",
    }
}

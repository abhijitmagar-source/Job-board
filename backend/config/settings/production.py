"""Production settings — enable via DJANGO_SETTINGS_MODULE=config.settings.production"""
from .base import *  # noqa: F403

DEBUG = False

# PostgreSQL on Render
DATABASES = {
    "default": env.db(
        "DATABASE_URL",
        default="postgresql://jobboard:jobboard@localhost:5432/jobboard",
    )
}

# Fall back to in-process cache when Redis is not provisioned (e.g. Render free tier)
if not env("REDIS_URL", default=""):
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
            "LOCATION": "jobboard-prod",
            "KEY_PREFIX": "jobboard",
            "TIMEOUT": 300,
        }
    }

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = env.bool("SECURE_SSL_REDIRECT", default=True)
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

"""Production settings — enable via DJANGO_SETTINGS_MODULE=config.settings.production"""
from .base import *  # noqa: F403

DEBUG = False

# -------------------
# DATABASE (Render / Postgres)
# -------------------
DATABASES = {
    "default": env.db(
        "DATABASE_URL",
        default="postgresql://jobboard:jobboard@localhost:5432/jobboard",
    )
}

# -------------------
# REDIS / CACHE
# -------------------
REDIS_URL = env("REDIS_URL", default="")

if REDIS_URL:
    CACHES = {
        "default": {
            "BACKEND": "django_redis.cache.RedisCache",
            "LOCATION": REDIS_URL,
            "OPTIONS": {
                "CLIENT_CLASS": "django_redis.client.DefaultClient",
            },
            "KEY_PREFIX": "jobboard",
        }
    }
else:
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
            "LOCATION": "jobboard-prod",
            "TIMEOUT": 300,
        }
    }

# -------------------
# SECURITY
# -------------------
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

SECURE_SSL_REDIRECT = env.bool("SECURE_SSL_REDIRECT", default=True)

SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# IMPORTANT (often missing in production)
ALLOWED_HOSTS = env.list("ALLOWED_HOSTS", default=["localhost"])

CSRF_TRUSTED_ORIGINS = env.list(
    "CSRF_TRUSTED_ORIGINS",
    default=[],
)
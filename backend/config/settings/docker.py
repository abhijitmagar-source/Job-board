"""
Docker Compose settings — production-hardened but without HTTPS redirect
(local compose serves HTTP on localhost).
"""
from .production import *  # noqa: F403

DEBUG = env.bool("DEBUG", default=False)  # noqa: F405

SECURE_SSL_REDIRECT = env.bool("SECURE_SSL_REDIRECT", default=False)
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False

ALLOWED_HOSTS = env.list(  # noqa: F405
    "ALLOWED_HOSTS",
    default=["localhost", "127.0.0.1", "backend", "nginx"],
)

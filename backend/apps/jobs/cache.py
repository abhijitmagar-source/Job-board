"""
Redis-backed caching for public job list responses.

Uses a version counter so invalidation does not require scanning cache keys.
"""
from __future__ import annotations

import hashlib
import json
from typing import Any

from django.conf import settings
from django.core.cache import cache
from django.http import QueryDict

LIST_PREFIX = "jobs:list"
LIST_VERSION_KEY = "jobs:list:version"


def _normalize_query_params(params: QueryDict) -> dict[str, list[str]]:
    """Stable representation of query string for cache key hashing."""
    return {key: sorted(params.getlist(key)) for key in sorted(params.keys())}


def _query_params(request) -> QueryDict:
    return getattr(request, "query_params", request.GET)


def build_list_cache_key(request) -> str | None:
    """
    Build a cache key for the job list endpoint.

    Skips cache for recruiter-specific `?mine=1` lists.
    Job seekers get a per-user key because `is_saved` is personalized.
    """
    params = _query_params(request)
    if params.get("mine") in ("1", "true"):
        return None

    payload = json.dumps(_normalize_query_params(params), sort_keys=True)
    query_hash = hashlib.sha256(payload.encode()).hexdigest()[:16]

    user = request.user
    if user.is_authenticated and user.is_job_seeker:
        segment = f"seeker:{user.id}"
    else:
        segment = "public"

    version = cache.get(LIST_VERSION_KEY, 0)
    return f"{LIST_PREFIX}:v{version}:{segment}:{query_hash}"


def get_cached_list(cache_key: str) -> dict[str, Any] | None:
    return cache.get(cache_key)


def set_cached_list(cache_key: str, data: dict[str, Any]) -> None:
    cache.set(cache_key, data, timeout=settings.JOBS_LIST_CACHE_TTL)


def invalidate_job_list_cache() -> None:
    """Bump list version — existing list keys expire naturally via TTL."""
    try:
        cache.incr(LIST_VERSION_KEY)
    except ValueError:
        cache.set(LIST_VERSION_KEY, 1, timeout=None)

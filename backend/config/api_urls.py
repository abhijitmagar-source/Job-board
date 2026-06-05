"""API v1 URL router — app URL includes added in Phases 3–5."""
from django.urls import include, path

from config.views import HealthCheckView

urlpatterns = [
    path("health/", HealthCheckView.as_view(), name="health-check"),
    path("auth/", include("apps.accounts.urls")),
    path("", include("apps.companies.urls")),
    path("", include("apps.jobs.urls")),
    path("", include("apps.applications.urls")),
]

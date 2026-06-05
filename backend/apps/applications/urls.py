from django.urls import path

from apps.applications import views

urlpatterns = [
    path("applications/", views.ApplyForJobView.as_view(), name="application-apply"),
    path("applications/me/", views.MyApplicationsView.as_view(), name="application-me"),
    path(
        "applications/<int:pk>/status/",
        views.ApplicationStatusUpdateView.as_view(),
        name="application-status",
    ),
    path(
        "jobs/<int:job_id>/applicants/",
        views.JobApplicantsView.as_view(),
        name="job-applicants",
    ),
]

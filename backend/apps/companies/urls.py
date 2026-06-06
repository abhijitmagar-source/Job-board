from django.urls import path
from rest_framework.routers import DefaultRouter

from apps.companies import views

router = DefaultRouter()
router.register("companies", views.CompanyViewSet, basename="company")

urlpatterns = [
    path(
        "companies/<int:pk>/upload-logo/",
        views.CompanyLogoUploadView.as_view(),
        name="company-upload-logo",
    ),
] + router.urls

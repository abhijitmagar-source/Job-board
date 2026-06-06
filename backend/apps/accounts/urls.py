from django.urls import path
from rest_framework.routers import DefaultRouter

from apps.accounts import admin_views, views

router = DefaultRouter()
router.register("admin/users", admin_views.AdminUserViewSet, basename="admin-users")
router.register("admin/companies", admin_views.AdminCompanyViewSet, basename="admin-companies")
router.register("admin/jobs", admin_views.AdminJobViewSet, basename="admin-jobs")
router.register(
    "admin/applications",
    admin_views.AdminApplicationViewSet,
    basename="admin-applications",
)

urlpatterns = [
    path("register/", views.RegisterView.as_view(), name="auth-register"),
    path("login/", views.LoginView.as_view(), name="auth-login"),
    path("refresh/", views.RefreshTokenView.as_view(), name="auth-refresh"),
    path("logout/", views.LogoutView.as_view(), name="auth-logout"),
    path(
        "password-reset/",
        views.PasswordResetRequestView.as_view(),
        name="auth-password-reset",
    ),
    path(
        "password-reset/confirm/",
        views.PasswordResetConfirmView.as_view(),
        name="auth-password-reset-confirm",
    ),
    path("me/", views.CurrentUserView.as_view(), name="auth-me"),
    path("profile/me/", views.ProfileMeView.as_view(), name="profile-me"),
    path("upload/resume/", views.UploadResumeView.as_view(), name="upload-resume"),
    path(
        "upload/profile-image/",
        views.UploadProfileImageView.as_view(),
        name="upload-profile-image",
    ),
    path(
        "dashboard/candidate/",
        views.CandidateDashboardView.as_view(),
        name="dashboard-candidate",
    ),
    path(
        "dashboard/recruiter/",
        views.RecruiterDashboardView.as_view(),
        name="dashboard-recruiter",
    ),
    path("dashboard/admin/", views.AdminDashboardView.as_view(), name="dashboard-admin"),
] + router.urls

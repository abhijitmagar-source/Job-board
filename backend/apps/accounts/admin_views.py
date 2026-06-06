"""Admin-only management APIs."""

from django.contrib.auth import get_user_model
from drf_spectacular.utils import extend_schema_view
from rest_framework import viewsets
from rest_framework.filters import OrderingFilter, SearchFilter

from apps.accounts.permissions import IsAdmin
from apps.accounts.serializers import UserSerializer
from apps.applications.models import Application
from apps.applications.serializers import ApplicationSerializer
from apps.companies.models import Company
from apps.companies.serializers import CompanySerializer
from apps.jobs.models import Job
from apps.jobs.serializers import JobSerializer

User = get_user_model()


@extend_schema_view()
class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["email"]
    ordering_fields = ["date_joined", "email", "role"]
    http_method_names = ["get", "patch", "delete", "head", "options"]


@extend_schema_view()
class AdminCompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.select_related("owner").order_by("-created_at")
    serializer_class = CompanySerializer
    permission_classes = [IsAdmin]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["name", "description", "location"]
    ordering_fields = ["name", "created_at"]
    http_method_names = ["get", "patch", "delete", "head", "options"]


@extend_schema_view()
class AdminJobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.select_related("company", "posted_by").order_by("-created_at")
    serializer_class = JobSerializer
    permission_classes = [IsAdmin]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["title", "description", "location"]
    ordering_fields = ["created_at", "title", "salary"]
    http_method_names = ["get", "patch", "delete", "head", "options"]


@extend_schema_view()
class AdminApplicationViewSet(viewsets.ModelViewSet):
    queryset = Application.objects.select_related(
        "job", "job__company", "applicant"
    ).order_by("-applied_at")
    serializer_class = ApplicationSerializer
    permission_classes = [IsAdmin]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["applicant__email", "job__title"]
    ordering_fields = ["applied_at", "status"]
    http_method_names = ["get", "patch", "delete", "head", "options"]

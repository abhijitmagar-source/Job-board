from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import viewsets
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import AllowAny, IsAuthenticated

from apps.accounts.permissions import IsRecruiter
from apps.companies.models import Company
from apps.companies.permissions import IsCompanyOwner
from apps.companies.serializers import CompanySerializer


@extend_schema_view(
    list=extend_schema(
        tags=["Companies"],
        summary="List companies",
        description="Public list. Recruiters may pass `?mine=1` to list own companies.",
        auth=[],
    ),
    retrieve=extend_schema(tags=["Companies"], summary="Get company", auth=[]),
    create=extend_schema(tags=["Companies"], summary="Create company"),
    update=extend_schema(tags=["Companies"], summary="Update company"),
    partial_update=extend_schema(tags=["Companies"], summary="Partial update company"),
    destroy=extend_schema(tags=["Companies"], summary="Delete company"),
)
class CompanyViewSet(viewsets.ModelViewSet):
    """
    Companies are publicly readable.
    Recruiters create companies; only the owner may update or delete.
    """

    queryset = Company.objects.none()
    serializer_class = CompanySerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ["name", "description"]
    ordering_fields = ["name", "created_at"]
    ordering = ["name"]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Company.objects.none()
        qs = Company.objects.select_related("owner")
        mine = self.request.query_params.get("mine")
        if mine in ("1", "true") and self.request.user.is_authenticated:
            return qs.filter(owner=self.request.user)
        return qs

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        if self.action == "create":
            return [IsAuthenticated(), IsRecruiter()]
        return [IsAuthenticated(), IsRecruiter(), IsCompanyOwner()]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

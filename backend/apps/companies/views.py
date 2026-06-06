from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import status, viewsets
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.cloudinary_utils import upload_file
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
    queryset = Company.objects.none()
    serializer_class = CompanySerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ["name", "description", "location"]
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


@extend_schema(
    tags=["Companies"],
    summary="Upload company logo",
    request=None,
    responses={200: CompanySerializer},
)
class CompanyLogoUploadView(APIView):
    permission_classes = [IsAuthenticated, IsRecruiter]
    parser_classes = [MultiPartParser, FormParser]
    serializer_class = CompanySerializer

    def post(self, request, pk: int):
        company = get_object_or_404(Company, pk=pk, owner=request.user)
        file = request.FILES.get("file")
        if not file:
            return Response({"detail": "No file provided."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            url = upload_file(file, "company-logos")
        except ValidationError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        company.logo_url = url
        company.save(update_fields=["logo_url", "updated_at"])
        return Response(CompanySerializer(company).data)

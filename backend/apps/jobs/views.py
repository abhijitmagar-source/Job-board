from django.db.models import Exists, OuterRef, Q
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import status, viewsets
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from apps.accounts.permissions import IsJobSeeker, IsRecruiter
from apps.jobs.cache import (
    build_list_cache_key,
    get_cached_list,
    invalidate_job_list_cache,
    set_cached_list,
)
from apps.jobs.filters import JobFilter
from apps.jobs.models import Job, SavedJob
from apps.jobs.permissions import IsJobOwner, IsSavedJobOwner
from apps.jobs.serializers import JobCreateSerializer, JobSerializer, SavedJobSerializer
from config.schema import JOB_CREATE_EXAMPLE


@extend_schema_view(
    list=extend_schema(
        tags=["Jobs"],
        summary="List jobs",
        description=(
            "Browse active jobs with `search`, `location`, `job_type`, "
            "`experience_level`, `company`, `salary_min`, `salary_max`, and `ordering`. "
            "Responses are cached (Redis). Recruiters: `?mine=1` for own jobs."
        ),
        auth=[],
    ),
    retrieve=extend_schema(tags=["Jobs"], summary="Get job", auth=[]),
    create=extend_schema(
        tags=["Jobs"],
        summary="Create job",
        examples=[JOB_CREATE_EXAMPLE],
    ),
    update=extend_schema(tags=["Jobs"], summary="Update job"),
    partial_update=extend_schema(tags=["Jobs"], summary="Partial update job"),
    destroy=extend_schema(
        tags=["Jobs"],
        summary="Delete job",
        description="Soft-delete: sets `is_active=false`.",
    ),
)
class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.none()
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = JobFilter
    search_fields = ["title", "description", "company__name", "location"]
    ordering_fields = ["created_at", "salary", "title"]
    ordering = ["-created_at"]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Job.objects.none()
        qs = Job.objects.select_related("company", "posted_by")
        user = self.request.user
        mine = self.request.query_params.get("mine")

        if mine in ("1", "true") and user.is_authenticated and user.is_recruiter:
            return qs.filter(posted_by=user)

        if self.action == "list" and not (
            user.is_authenticated and user.is_recruiter and mine
        ):
            qs = qs.filter(is_active=True)
        elif self.action == "retrieve":
            if user.is_authenticated and user.is_recruiter:
                qs = qs.filter(Q(is_active=True) | Q(posted_by=user))
            else:
                qs = qs.filter(is_active=True)

        if (
            self.action in ("list", "retrieve")
            and user.is_authenticated
            and user.is_job_seeker
        ):
            qs = qs.annotate(
                _is_saved=Exists(
                    SavedJob.objects.filter(user=user, job_id=OuterRef("pk"))
                )
            )

        return qs

    def get_serializer_class(self):
        if self.action == "create":
            return JobCreateSerializer
        return JobSerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        if self.action == "create":
            return [IsAuthenticated(), IsRecruiter()]
        return [IsAuthenticated(), IsRecruiter(), IsJobOwner()]

    def list(self, request, *args, **kwargs):
        cache_key = build_list_cache_key(request)
        if cache_key:
            cached = get_cached_list(cache_key)
            if cached is not None:
                return Response(cached)

        response = super().list(request, *args, **kwargs)
        if cache_key and response.status_code == 200:
            set_cached_list(cache_key, response.data)
        return response

    def perform_create(self, serializer):
        serializer.save(posted_by=self.request.user, is_active=True)
        invalidate_job_list_cache()

    def perform_update(self, serializer):
        serializer.save()
        invalidate_job_list_cache()

    def destroy(self, request, *args, **kwargs):
        job = self.get_object()
        job.is_active = False
        job.save(update_fields=["is_active", "updated_at"])
        invalidate_job_list_cache()
        return Response(status=status.HTTP_204_NO_CONTENT)


@extend_schema_view(
    list=extend_schema(tags=["Saved Jobs"], summary="List saved jobs"),
    create=extend_schema(tags=["Saved Jobs"], summary="Save a job"),
    destroy=extend_schema(tags=["Saved Jobs"], summary="Unsave a job"),
)
class SavedJobViewSet(viewsets.ModelViewSet):
    queryset = SavedJob.objects.none()
    serializer_class = SavedJobSerializer
    http_method_names = ["get", "post", "delete", "head", "options"]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return SavedJob.objects.none()
        return (
            SavedJob.objects.filter(user=self.request.user)
            .select_related("job", "job__company", "job__posted_by")
            .order_by("-saved_at")
        )

    def get_permissions(self):
        if self.action == "create":
            return [IsAuthenticated(), IsJobSeeker()]
        return [IsAuthenticated(), IsJobSeeker(), IsSavedJobOwner()]

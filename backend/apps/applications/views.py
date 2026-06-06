from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import OpenApiParameter, extend_schema, extend_schema_view
from rest_framework import generics, status
from rest_framework.filters import OrderingFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounts.permissions import IsJobSeeker, IsRecruiter
from apps.applications.models import Application
from apps.applications.permissions import IsJobPoster, user_can_manage_job_applications
from apps.applications.serializers import (
    ApplicationCreateSerializer,
    ApplicationSerializer,
    ApplicationStatusUpdateSerializer,
    JobApplicantSerializer,
)
from apps.jobs.models import Job
from config.schema import APPLY_EXAMPLE, STATUS_UPDATE_EXAMPLE


@extend_schema(
    tags=["Applications"],
    summary="Apply for a job",
    description="Job seeker submits an application for an active job.",
    request=ApplicationCreateSerializer,
    responses={201: ApplicationSerializer},
    examples=[APPLY_EXAMPLE],
)
class ApplyForJobView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated, IsJobSeeker]
    serializer_class = ApplicationCreateSerializer

    def post(self, request, *args, **kwargs):
        create_serializer = self.get_serializer(data=request.data)
        create_serializer.is_valid(raise_exception=True)
        application = create_serializer.save()
        application = (
            Application.objects.select_related("job", "job__company", "job__posted_by")
            .get(pk=application.pk)
        )
        return Response(
            ApplicationSerializer(application, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


@extend_schema(
    tags=["Applications"],
    summary="My applications",
    description="List applications submitted by the authenticated job seeker. Filter by `status` or `job`.",
)
class MyApplicationsView(generics.ListAPIView):
    queryset = Application.objects.none()
    permission_classes = [IsAuthenticated, IsJobSeeker]
    serializer_class = ApplicationSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["status", "job"]
    ordering_fields = ["applied_at", "status"]
    ordering = ["-applied_at"]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Application.objects.none()
        return (
            Application.objects.filter(applicant=self.request.user)
            .select_related("job", "job__company", "job__posted_by")
            .order_by("-applied_at")
        )


@extend_schema(
    tags=["Applications"],
    summary="List job applicants",
    description="Recruiter views applicants for a job they posted. Filter by `status`.",
    parameters=[
        OpenApiParameter(
            name="job_id",
            type=int,
            location=OpenApiParameter.PATH,
            description="Job ID",
        ),
    ],
)
class JobApplicantsView(generics.ListAPIView):
    queryset = Application.objects.none()
    permission_classes = [IsAuthenticated, IsRecruiter]
    serializer_class = JobApplicantSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["status"]
    ordering_fields = ["applied_at", "status"]
    ordering = ["-applied_at"]

    def get_job(self) -> Job:
        job = get_object_or_404(Job.objects.select_related("posted_by"), pk=self.kwargs["job_id"])
        if not user_can_manage_job_applications(self.request.user, job):
            self.permission_denied(
                self.request,
                message="You can only view applicants for jobs you posted.",
            )
        return job

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Application.objects.none()
        job = self.get_job()
        return (
            Application.objects.filter(job=job)
            .select_related("applicant", "applicant__candidate_profile")
            .order_by("-applied_at")
        )


@extend_schema_view(
    patch=extend_schema(
        tags=["Applications"],
        summary="Update application status",
        description="Recruiter (job poster) updates applicant status.",
        request=ApplicationStatusUpdateSerializer,
        responses={200: JobApplicantSerializer},
        examples=[STATUS_UPDATE_EXAMPLE],
    ),
    put=extend_schema(
        tags=["Applications"],
        summary="Update application status",
        request=ApplicationStatusUpdateSerializer,
        responses={200: JobApplicantSerializer},
        examples=[STATUS_UPDATE_EXAMPLE],
    ),
)
class ApplicationStatusUpdateView(generics.UpdateAPIView):
    queryset = Application.objects.none()
    permission_classes = [IsAuthenticated, IsRecruiter, IsJobPoster]
    serializer_class = ApplicationStatusUpdateSerializer
    http_method_names = ["patch", "put", "head", "options"]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Application.objects.none()
        return Application.objects.select_related("job", "job__posted_by")

    def patch(self, request, *args, **kwargs):
        application = self.get_object()
        serializer = self.get_serializer(application, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        application = (
            Application.objects.select_related("applicant", "applicant__candidate_profile")
            .get(pk=application.pk)
        )
        return Response(JobApplicantSerializer(application).data)

    def put(self, request, *args, **kwargs):
        return self.patch(request, *args, **kwargs)

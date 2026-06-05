from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.accounts.serializers import ProfileSerializer
from apps.applications.models import Application, ApplicationStatus
from apps.jobs.models import Job
from apps.jobs.serializers import JobSerializer

User = get_user_model()


class ApplicationCreateSerializer(serializers.ModelSerializer):
    job_id = serializers.PrimaryKeyRelatedField(
        queryset=Job.objects.filter(is_active=True),
        source="job",
        write_only=True,
    )

    class Meta:
        model = Application
        fields = ("job_id", "cover_letter")

    def validate_job_id(self, job: Job) -> Job:
        user = self.context["request"].user
        if Application.objects.filter(job=job, applicant=user).exists():
            raise serializers.ValidationError("You have already applied for this job.")
        return job

    def create(self, validated_data):
        return Application.objects.create(
            applicant=self.context["request"].user,
            **validated_data,
        )


class ApplicationSerializer(serializers.ModelSerializer):
    job = JobSerializer(read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Application
        fields = (
            "id",
            "job",
            "status",
            "status_display",
            "cover_letter",
            "applied_at",
            "updated_at",
        )
        read_only_fields = fields


class ApplicantSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ("id", "email", "profile")
        read_only_fields = fields


class JobApplicantSerializer(serializers.ModelSerializer):
    applicant = ApplicantSerializer(read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Application
        fields = (
            "id",
            "applicant",
            "status",
            "status_display",
            "cover_letter",
            "applied_at",
            "updated_at",
        )
        read_only_fields = fields


class ApplicationStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ("status",)

    def validate_status(self, value: str) -> str:
        if value not in ApplicationStatus.values:
            raise serializers.ValidationError("Invalid application status.")
        return value

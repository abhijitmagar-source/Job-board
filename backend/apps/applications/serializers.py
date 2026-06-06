from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.accounts.serializers import CandidateProfileSerializer
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
        fields = ("job_id", "cover_letter", "resume_url")

    def validate_job_id(self, job: Job) -> Job:
        user = self.context["request"].user
        if Application.objects.filter(job=job, applicant=user).exists():
            raise serializers.ValidationError("You have already applied for this job.")
        return job

    def create(self, validated_data):
        user = self.context["request"].user
        if not validated_data.get("resume_url") and hasattr(user, "candidate_profile"):
            validated_data["resume_url"] = user.candidate_profile.resume_url or ""
        return Application.objects.create(applicant=user, **validated_data)


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
            "resume_url",
            "applied_at",
            "updated_at",
        )
        read_only_fields = fields


class ApplicantSerializer(serializers.ModelSerializer):
    candidate_profile = CandidateProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ("id", "email", "candidate_profile")
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
            "resume_url",
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

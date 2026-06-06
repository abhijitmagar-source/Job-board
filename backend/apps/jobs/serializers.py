from rest_framework import serializers

from apps.companies.models import Company
from apps.companies.serializers import CompanyBriefSerializer
from apps.jobs.models import Job, SavedJob


class JobSerializer(serializers.ModelSerializer):
    company = CompanyBriefSerializer(read_only=True)
    company_id = serializers.PrimaryKeyRelatedField(
        queryset=Company.objects.all(),
        source="company",
        write_only=True,
    )
    posted_by_email = serializers.EmailField(source="posted_by.email", read_only=True)
    is_saved = serializers.SerializerMethodField()

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and not (
            request.user.is_authenticated and request.user.is_admin
        ):
            self.fields["is_featured"].read_only = True

    class Meta:
        model = Job
        fields = (
            "id",
            "title",
            "description",
            "salary",
            "skills",
            "location",
            "category",
            "job_type",
            "experience_level",
            "is_featured",
            "is_active",
            "company",
            "company_id",
            "posted_by_email",
            "is_saved",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "posted_by_email", "is_saved", "created_at", "updated_at")

    def get_is_saved(self, obj) -> bool:
        if hasattr(obj, "_is_saved"):
            return bool(obj._is_saved)
        request = self.context.get("request")
        if not request or not request.user.is_authenticated or not request.user.is_candidate:
            return False
        return SavedJob.objects.filter(user=request.user, job=obj).exists()

    def validate_company_id(self, company: Company) -> Company:
        request = self.context.get("request")
        if request and company.owner_id != request.user.id:
            raise serializers.ValidationError(
                "You can only post jobs for companies you own."
            )
        return company


class JobCreateSerializer(JobSerializer):
    class Meta(JobSerializer.Meta):
        read_only_fields = JobSerializer.Meta.read_only_fields + ("is_active",)


class SavedJobSerializer(serializers.ModelSerializer):
    job = JobSerializer(read_only=True)
    job_id = serializers.PrimaryKeyRelatedField(
        queryset=Job.objects.filter(is_active=True),
        source="job",
        write_only=True,
    )

    class Meta:
        model = SavedJob
        fields = ("id", "job", "job_id", "saved_at")
        read_only_fields = ("id", "job", "saved_at")

    def validate_job_id(self, job: Job) -> Job:
        user = self.context["request"].user
        if SavedJob.objects.filter(user=user, job=job).exists():
            raise serializers.ValidationError("Job is already saved.")
        return job

    def create(self, validated_data):
        return SavedJob.objects.create(user=self.context["request"].user, **validated_data)

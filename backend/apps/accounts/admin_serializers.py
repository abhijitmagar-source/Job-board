"""Admin-only serializers for platform management APIs."""

from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.accounts.models import UserRole
from apps.applications.models import Application, ApplicationStatus
from apps.companies.models import Company
from apps.jobs.models import Job

User = get_user_model()


class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "role", "is_active", "date_joined")
        read_only_fields = ("id", "email", "date_joined")


class AdminUserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("role", "is_active")

    def validate_role(self, value: str) -> str:
        if value not in UserRole.values:
            raise serializers.ValidationError("Invalid role.")
        return value


class AdminCompanyUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ("name", "website", "description", "location", "logo_url")


class AdminJobUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = ("title", "is_featured", "is_active")


class AdminApplicationUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ("status",)

    def validate_status(self, value: str) -> str:
        if value not in ApplicationStatus.values:
            raise serializers.ValidationError("Invalid application status.")
        return value

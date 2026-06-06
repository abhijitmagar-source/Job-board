from rest_framework import serializers

from apps.companies.models import Company


class CompanySerializer(serializers.ModelSerializer):
    owner_email = serializers.EmailField(source="owner.email", read_only=True)

    class Meta:
        model = Company
        fields = (
            "id",
            "name",
            "website",
            "description",
            "location",
            "logo_url",
            "owner_email",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "owner_email", "created_at", "updated_at")


class CompanyBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ("id", "name", "logo_url", "location")

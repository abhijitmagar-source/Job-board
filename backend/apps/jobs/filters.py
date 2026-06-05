import django_filters

from apps.jobs.models import Job


class JobFilter(django_filters.FilterSet):
    location = django_filters.CharFilter(lookup_expr="icontains")
    company = django_filters.NumberFilter(field_name="company_id")
    salary_min = django_filters.NumberFilter(field_name="salary", lookup_expr="gte")
    salary_max = django_filters.NumberFilter(field_name="salary", lookup_expr="lte")

    class Meta:
        model = Job
        fields = ["location", "job_type", "experience_level", "company", "is_active"]

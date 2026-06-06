import django_filters

from apps.jobs.models import Job


class JobFilter(django_filters.FilterSet):
    location = django_filters.CharFilter(lookup_expr="icontains")
    company = django_filters.NumberFilter(field_name="company_id")
    salary_min = django_filters.NumberFilter(field_name="salary", lookup_expr="gte")
    salary_max = django_filters.NumberFilter(field_name="salary", lookup_expr="lte")
    category = django_filters.CharFilter(lookup_expr="iexact")
    is_featured = django_filters.BooleanFilter()
    skills = django_filters.CharFilter(method="filter_skills")

    class Meta:
        model = Job
        fields = [
            "location",
            "job_type",
            "experience_level",
            "company",
            "category",
            "is_active",
            "is_featured",
        ]

    def filter_skills(self, queryset, name, value):
        if not value:
            return queryset
        for skill in value.split(","):
            skill = skill.strip()
            if skill:
                queryset = queryset.filter(skills__icontains=skill)
        return queryset

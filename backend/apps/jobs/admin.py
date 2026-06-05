from django.contrib import admin

from .models import Job, SavedJob


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "company",
        "location",
        "job_type",
        "is_active",
        "created_at",
    )
    list_filter = ("job_type", "experience_level", "is_active", "location")
    search_fields = ("title", "description", "company__name")
    raw_id_fields = ("company", "posted_by")


@admin.register(SavedJob)
class SavedJobAdmin(admin.ModelAdmin):
    list_display = ("user", "job", "saved_at")
    raw_id_fields = ("user", "job")

from django.contrib import admin

from .models import Company


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ("name", "owner", "website", "created_at")
    list_filter = ("created_at",)
    search_fields = ("name", "owner__email")
    raw_id_fields = ("owner",)

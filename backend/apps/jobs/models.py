from django.conf import settings
from django.db import models

from apps.companies.models import Company


class JobType(models.TextChoices):
    FULL_TIME = "full_time", "Full Time"
    PART_TIME = "part_time", "Part Time"
    CONTRACT = "contract", "Contract"
    REMOTE = "remote", "Remote"
    HYBRID = "hybrid", "Hybrid"


class ExperienceLevel(models.TextChoices):
    ENTRY = "entry", "Entry"
    MID = "mid", "Mid"
    SENIOR = "senior", "Senior"
    LEAD = "lead", "Lead"


class JobCategory(models.TextChoices):
    ENGINEERING = "engineering", "Engineering"
    DESIGN = "design", "Design"
    PRODUCT = "product", "Product"
    MARKETING = "marketing", "Marketing"
    SALES = "sales", "Sales"
    OPERATIONS = "operations", "Operations"
    FINANCE = "finance", "Finance"
    HR = "hr", "Human Resources"
    OTHER = "other", "Other"


class Job(models.Model):
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="jobs",
    )
    posted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="posted_jobs",
    )
    title = models.CharField(max_length=255, db_index=True)
    description = models.TextField()
    salary = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    skills = models.TextField(blank=True, help_text="Comma-separated required skills")
    location = models.CharField(max_length=255, db_index=True)
    category = models.CharField(
        max_length=30,
        choices=JobCategory.choices,
        default=JobCategory.OTHER,
        db_index=True,
    )
    job_type = models.CharField(max_length=20, choices=JobType.choices, db_index=True)
    experience_level = models.CharField(
        max_length=20,
        choices=ExperienceLevel.choices,
        db_index=True,
    )
    is_featured = models.BooleanField(default=False, db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "jobs_job"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["is_active", "-created_at"]),
            models.Index(fields=["is_featured", "-created_at"]),
        ]

    def __str__(self) -> str:
        return f"{self.title} @ {self.company.name}"


class SavedJob(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="saved_jobs",
    )
    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name="saved_by",
    )
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "jobs_savedjob"
        ordering = ["-saved_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "job"],
                name="unique_saved_job_per_user",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.user.email} saved {self.job.title}"

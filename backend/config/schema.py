"""Shared OpenAPI components and examples for drf-spectacular."""

from drf_spectacular.utils import OpenApiExample

REGISTER_EXAMPLE = OpenApiExample(
    "Job seeker registration",
    value={
        "email": "seeker@example.com",
        "password": "SecurePass123!",
        "password_confirm": "SecurePass123!",
        "role": "candidate",
        "full_name": "Jane Doe",
    },
    request_only=True,
)

LOGIN_EXAMPLE = OpenApiExample(
    "Login",
    value={"email": "seeker@example.com", "password": "SecurePass123!"},
    request_only=True,
)

JOB_CREATE_EXAMPLE = OpenApiExample(
    "Create job",
    value={
        "title": "Senior Python Developer",
        "description": "Build APIs with Django and DRF.",
        "salary": "95000.00",
        "location": "Remote",
        "job_type": "remote",
        "experience_level": "senior",
        "company_id": 1,
    },
    request_only=True,
)

APPLY_EXAMPLE = OpenApiExample(
    "Apply for job",
    value={"job_id": 1, "cover_letter": "I have 5 years of Django experience."},
    request_only=True,
)

STATUS_UPDATE_EXAMPLE = OpenApiExample(
    "Shortlist applicant",
    value={"status": "shortlisted"},
    request_only=True,
)

from rest_framework.permissions import BasePermission

from apps.jobs.models import Job


class IsJobPoster(BasePermission):
    """Recruiter who posted the job may view or manage its applications."""

    message = "You can only manage applications for jobs you posted."

    def has_permission(self, request, view) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_recruiter
        )

    def has_object_permission(self, request, view, obj) -> bool:
        job = obj.job if hasattr(obj, "job") else obj
        return job.posted_by_id == request.user.id


def user_can_manage_job_applications(user, job: Job) -> bool:
    return user.is_authenticated and user.is_recruiter and job.posted_by_id == user.id

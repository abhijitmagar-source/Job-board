from rest_framework.permissions import BasePermission


class IsRecruiter(BasePermission):
    """Allow access only to users with the recruiter role."""

    message = "Recruiter account required."

    def has_permission(self, request, view) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_recruiter
        )


class IsJobSeeker(BasePermission):
    """Allow access only to users with the job seeker role."""

    message = "Job seeker account required."

    def has_permission(self, request, view) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_job_seeker
        )

from rest_framework.permissions import BasePermission


class IsRecruiter(BasePermission):
    message = "Recruiter account required."

    def has_permission(self, request, view) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_recruiter
        )


class IsCandidate(BasePermission):
    message = "Candidate account required."

    def has_permission(self, request, view) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_candidate
        )


class IsJobSeeker(IsCandidate):
    """Backward-compatible alias."""


class IsAdmin(BasePermission):
    message = "Admin account required."

    def has_permission(self, request, view) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_admin
        )

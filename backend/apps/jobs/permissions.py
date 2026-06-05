from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsJobOwner(BasePermission):
    """Recruiters may mutate only jobs they posted."""

    message = "You can only modify jobs you posted."

    def has_object_permission(self, request, view, obj) -> bool:
        if request.method in SAFE_METHODS:
            return True
        return obj.posted_by_id == request.user.id


class IsSavedJobOwner(BasePermission):
    message = "You can only manage your own saved jobs."

    def has_object_permission(self, request, view, obj) -> bool:
        return obj.user_id == request.user.id

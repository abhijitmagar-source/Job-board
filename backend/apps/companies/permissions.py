from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsCompanyOwner(BasePermission):
    """Write access only for the company owner; reads are public."""

    message = "You do not own this company."

    def has_object_permission(self, request, view, obj) -> bool:
        if request.method in SAFE_METHODS:
            return True
        return obj.owner_id == request.user.id

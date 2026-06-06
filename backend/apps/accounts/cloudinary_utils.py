"""Cloudinary upload helpers — falls back to local storage when not configured."""

from __future__ import annotations

import uuid
from pathlib import Path

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import UploadedFile

MAX_UPLOAD_SIZE = 5 * 1024 * 1024  # 5 MB

ALLOWED_EXTENSIONS: dict[str, set[str]] = {
    "resume": {".pdf", ".doc", ".docx"},
    "profile-image": {".jpg", ".jpeg", ".png", ".gif", ".webp"},
    "company-logo": {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"},
}


def _cloudinary_configured() -> bool:
    return bool(
        getattr(settings, "CLOUDINARY_CLOUD_NAME", "")
        and getattr(settings, "CLOUDINARY_API_KEY", "")
        and getattr(settings, "CLOUDINARY_API_SECRET", "")
    )


def validate_upload(file: UploadedFile, folder: str) -> None:
    """Validate file size and extension before upload."""
    if file.size > MAX_UPLOAD_SIZE:
        raise ValidationError("File size must not exceed 5 MB.")

    ext = Path(file.name).suffix.lower()
    allowed = ALLOWED_EXTENSIONS.get(folder, set())
    if allowed and ext not in allowed:
        raise ValidationError(
            f"Invalid file type. Allowed: {', '.join(sorted(allowed))}"
        )


def upload_file(file: UploadedFile, folder: str) -> str:
    """Upload a file and return its public URL."""
    validate_upload(file, folder)

    if _cloudinary_configured():
        import cloudinary.uploader

        result = cloudinary.uploader.upload(
            file,
            folder=f"jobboard/{folder}",
            resource_type="auto",
        )
        return result["secure_url"]

    ext = Path(file.name).suffix or ".bin"
    filename = f"{uuid.uuid4().hex}{ext}"
    dest_dir = Path(settings.MEDIA_ROOT) / folder
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest_path = dest_dir / filename
    with dest_path.open("wb+") as dest:
        for chunk in file.chunks():
            dest.write(chunk)

    base_url = getattr(settings, "MEDIA_BASE_URL", "").rstrip("/")
    relative = f"{settings.MEDIA_URL}{folder}/{filename}"
    if base_url:
        return f"{base_url}/{folder}/{filename}"
    return relative

"""Cloudinary upload helpers — falls back to local storage when not configured."""

from __future__ import annotations

import uuid
from pathlib import Path

from django.conf import settings
from django.core.files.uploadedfile import UploadedFile


def _cloudinary_configured() -> bool:
    return bool(
        getattr(settings, "CLOUDINARY_CLOUD_NAME", "")
        and getattr(settings, "CLOUDINARY_API_KEY", "")
        and getattr(settings, "CLOUDINARY_API_SECRET", "")
    )


def upload_file(file: UploadedFile, folder: str) -> str:
    """Upload a file and return its public URL."""
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
    return f"{settings.MEDIA_URL}{folder}/{filename}"

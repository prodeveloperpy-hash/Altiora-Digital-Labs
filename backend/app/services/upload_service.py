"""Handles admin image uploads to the local filesystem.

Files are written under ``settings.upload_dir`` and served as static assets under
``settings.upload_url_prefix``. Validation covers content type, extension, and a
configurable maximum size.
"""

from __future__ import annotations

import uuid
from pathlib import Path

from app.config import settings
from app.exceptions import ValidationError
from app.schemas.dashboard import UploadResponse

_ALLOWED_TYPES: dict[str, str] = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/svg+xml": ".svg",
}


class UploadService:
    def __init__(self) -> None:
        self.base_dir = Path(settings.upload_dir)

    def _ensure_dir(self) -> Path:
        self.base_dir.mkdir(parents=True, exist_ok=True)
        return self.base_dir

    def save_image(self, *, filename: str, content_type: str, data: bytes) -> UploadResponse:
        if content_type not in _ALLOWED_TYPES:
            raise ValidationError(
                "Unsupported image type.",
                errors={"file": "Allowed types: PNG, JPG, WEBP, GIF, SVG."},
            )
        if len(data) == 0:
            raise ValidationError("The uploaded file is empty.", errors={"file": "Empty file."})
        if len(data) > settings.upload_max_bytes:
            max_mb = settings.upload_max_bytes // (1024 * 1024)
            raise ValidationError(
                f"The file is too large. Maximum size is {max_mb} MB.",
                errors={"file": "File too large."},
            )

        extension = _ALLOWED_TYPES[content_type]
        stored_name = f"{uuid.uuid4().hex}{extension}"
        target = self._ensure_dir() / stored_name
        target.write_bytes(data)

        url = f"{settings.upload_url_prefix.rstrip('/')}/{stored_name}"
        return UploadResponse(
            url=url,
            filename=stored_name,
            size=len(data),
            content_type=content_type,
        )

"""Admin image upload endpoint."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, File, UploadFile, status

from app.api.admin_deps import CurrentAdmin, UploadServiceDep
from app.exceptions import ValidationError
from app.schemas.dashboard import UploadResponse

router = APIRouter(prefix="/uploads", tags=["Admin · Uploads"])


@router.post(
    "",
    response_model=UploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload an image (card art, bank logo, etc.)",
)
async def upload_image(
    _current: CurrentAdmin,
    service: UploadServiceDep,
    file: Annotated[UploadFile, File(description="Image file to upload")],
) -> UploadResponse:
    data = await file.read()
    content_type = file.content_type or "application/octet-stream"
    if not file.filename:
        raise ValidationError("A file is required.", errors={"file": "No file provided."})
    return service.save_image(
        filename=file.filename,
        content_type=content_type,
        data=data,
    )

from fastapi import APIRouter, UploadFile, File, HTTPException, Query

from app.config import PREVIEW_DEFAULT_LIMIT, PREVIEW_MAX_LIMIT
from app.services.file_handler import (
    validate_file,
    save_file,
    list_all_files,
    get_file_metadata,
    get_file_preview,
    FileValidationError,
)
from app.services.suggestions import generate_suggestions

router = APIRouter(tags=["files"])


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    content = await file.read()

    try:
        validate_file(file.filename, len(content))
    except FileValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))

    try:
        metadata = save_file(file.filename, content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process file: {e}")

    suggestions = generate_suggestions(metadata["schema"])

    return {
        "file_id": metadata["file_id"],
        "original_name": metadata["original_name"],
        "size_bytes": metadata["size_bytes"],
        "schema": metadata["schema"],
        "suggestions": suggestions,
    }


@router.get("/files")
async def list_files():
    files = list_all_files()
    return {"files": files}


@router.get("/files/{file_id}")
async def get_file(file_id: str):
    metadata = get_file_metadata(file_id)
    if not metadata:
        raise HTTPException(status_code=404, detail="File not found")
    return {
        "file_id": metadata["file_id"],
        "original_name": metadata["original_name"],
        "size_bytes": metadata["size_bytes"],
        "uploaded_at": metadata["uploaded_at"],
        "schema": metadata["schema"],
    }


@router.get("/files/{file_id}/preview")
async def preview_file(
    file_id: str,
    limit: int = Query(
        PREVIEW_DEFAULT_LIMIT,
        ge=1,
        le=PREVIEW_MAX_LIMIT,
        description="Number of rows to return from the start of the file",
    ),
):
    payload = get_file_preview(file_id, limit)
    if not payload:
        raise HTTPException(status_code=404, detail="File not found")
    return payload

import uuid
import aiofiles
from pathlib import Path
from fastapi import UploadFile, HTTPException, status


from backend.utils.config import settings
from backend.utils.logger import setup_logger


logger = setup_logger("Storage")


async def save_uploaded_file(file: UploadFile, subdir: str = "cv") -> Path:
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file name.",
        )
   
    ext = Path(file.filename).suffix.lower()
    if ext not in settings.ALLOWED_CV_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type '{ext}' is not allowed. Allowed types: {settings.ALLOWED_CV_EXTENSIONS}",
        )
   
    dest_dir = Path(settings.UPLOAD_DIR) / subdir
    dest_dir.mkdir(parents = True, exist_ok = True)
    dest_path = dest_dir / f"{uuid.uuid4().hex}{ext}"


    size = 0
    max_bytes = settings.MAX_CV_SIZE_MB * 1024 * 1024


    try:
        async with aiofiles.open(dest_path, "wb") as out:
            while chunk := await file.read(1024 * 1024):
                size += len(chunk)
                if size > max_bytes:
                    await out.close()
                    dest_path.unlink(missing_ok = True)
                    raise HTTPException(
                        status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"File size exceeds the maximum limit of {settings.MAX_CV_SIZE_MB} MB.",
                    )
                await out.write(chunk)
    except HTTPException:
        raise
    except Exception as e:
        dest_path.unlink(missing_ok = True)
        logger.error(f"Error saving file: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while saving the file.",
        )


    logger.info(f"File saved to {dest_path} ({size} bytes)")
    return dest_path

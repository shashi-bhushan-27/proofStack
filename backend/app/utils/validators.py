"""Input validators for file uploads and text content."""

from fastapi import HTTPException, status


def validate_pdf_file(
    content: bytes,
    filename: str,
    content_type: str | None,
    max_size_bytes: int,
) -> None:
    """Validate an uploaded PDF file.

    Raises HTTPException on any validation failure.
    """
    # File extension check
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are accepted",
        )

    # Content-type check
    if content_type and content_type not in (
        "application/pdf",
        "application/x-pdf",
        "application/octet-stream",
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid content type: {content_type}. Expected application/pdf",
        )

    # File size check
    if len(content) > max_size_bytes:
        max_mb = max_size_bytes / (1024 * 1024)
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size exceeds maximum allowed size of {max_mb:.0f}MB",
        )

    # Empty file check
    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty",
        )

    # PDF magic bytes check
    if not content[:4].startswith(b"%PDF"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File does not appear to be a valid PDF",
        )


def validate_job_description_text(text: str) -> None:
    """Validate job description text meets minimum requirements.

    Raises HTTPException on validation failure.
    """
    if not text or not text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job description text cannot be empty",
        )

    stripped = text.strip()
    if len(stripped) < 50:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job description is too short (minimum 50 characters)",
        )

    if len(stripped) > 50000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job description is too long (maximum 50,000 characters)",
        )

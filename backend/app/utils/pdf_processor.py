"""PDF text extraction using PyMuPDF (fitz).

Validates PDF structure, extracts text from all pages, and reports issues.
"""

import io
import logging
from dataclasses import dataclass, field

import fitz  # PyMuPDF

logger = logging.getLogger(__name__)

# PDF magic bytes
_PDF_MAGIC = b"%PDF"


@dataclass
class PdfExtractionResult:
    """Result of a PDF text extraction operation."""
    text: str = ""
    page_count: int = 0
    warnings: list[str] = field(default_factory=list)
    is_valid: bool = True
    error_message: str | None = None


def extract_text_from_pdf(content: bytes) -> PdfExtractionResult:
    """Extract text from a PDF file's raw bytes.

    Performs:
      1. Magic-byte validation
      2. Page-by-page text extraction with PyMuPDF
      3. Warnings for empty/problematic pages

    Args:
        content: Raw bytes of the PDF file.

    Returns:
        PdfExtractionResult with text, page count, and any warnings.
    """
    result = PdfExtractionResult()

    # Validate magic bytes
    if not content or not content[:4].startswith(_PDF_MAGIC):
        result.is_valid = False
        result.error_message = "File does not appear to be a valid PDF (missing magic bytes)"
        return result

    try:
        doc = fitz.open(stream=content, filetype="pdf")
    except Exception as exc:
        result.is_valid = False
        result.error_message = f"Failed to open PDF: {exc}"
        return result

    try:
        result.page_count = len(doc)

        if result.page_count == 0:
            result.is_valid = False
            result.error_message = "PDF contains no pages"
            return result

        pages_text: list[str] = []
        empty_pages: list[int] = []

        for page_num in range(result.page_count):
            try:
                page = doc[page_num]
                page_text = page.get_text("text")
                if page_text and page_text.strip():
                    pages_text.append(page_text)
                else:
                    empty_pages.append(page_num + 1)
            except Exception as exc:
                result.warnings.append(f"Error extracting page {page_num + 1}: {exc}")

        result.text = "\n\n".join(pages_text)

        if empty_pages:
            result.warnings.append(
                f"Empty pages (possibly scanned images): {empty_pages}"
            )

        if not result.text.strip():
            result.warnings.append(
                "No text could be extracted. The PDF may contain only images."
            )

    finally:
        doc.close()

    return result

import hashlib
import os
from pathlib import Path
from typing import Tuple, Generator, AsyncGenerator, Optional
from app.config import settings
from app.core.exceptions import AppException

# Supported formats: (extension -> (mime_type, magic_check_function))
def _is_png(b: bytes) -> bool:
    return len(b) >= 8 and b[:8] == b"\x89PNG\r\n\x1a\n"

def _is_jpeg(b: bytes) -> bool:
    return len(b) >= 3 and b[:3] == b"\xff\xd8\xff"

def _is_webp(b: bytes) -> bool:
    return len(b) >= 12 and b[:4] == b"RIFF" and b[8:12] == b"WEBP"

def _is_mp4(b: bytes) -> bool:
    if len(b) < 12:
        return False
    # Check for ftyp box
    return b[4:8] == b"ftyp" or b[:4] == b"ftyp"

def _is_webm(b: bytes) -> bool:
    return len(b) >= 4 and b[:4] == b"\x1a\x45\xdf\xa3"

def _is_mov(b: bytes) -> bool:
    if len(b) < 12:
        return False
    return b[4:8] in (b"ftyp", b"moov", b"wide", b"skip", b"free")

def _is_mp3(b: bytes) -> bool:
    if len(b) < 3:
        return False
    return b[:3] == b"ID3" or (b[0] == 0xFF and (b[1] & 0xE0) == 0xE0)

def _is_wav(b: bytes) -> bool:
    return len(b) >= 12 and b[:4] == b"RIFF" and b[8:12] == b"WAVE"

def _is_ogg(b: bytes) -> bool:
    return len(b) >= 4 and b[:4] == b"OggS"

def _is_svg(b: bytes) -> bool:
    # Reject binary content masquerading as SVG
    if b"\x00" in b[:1024]:
        return False
    return True

ALLOWED_FORMATS = {
    ".png": ("image/png", "image", _is_png),
    ".jpg": ("image/jpeg", "image", _is_jpeg),
    ".jpeg": ("image/jpeg", "image", _is_jpeg),
    ".webp": ("image/webp", "image", _is_webp),
    ".svg": ("image/svg+xml", "image", _is_svg),
    ".mp4": ("video/mp4", "video", _is_mp4),
    ".webm": ("video/webm", "video", _is_webm),
    ".mov": ("video/quicktime", "video", _is_mov),
    ".mp3": ("audio/mpeg", "audio", _is_mp3),
    ".wav": ("audio/wav", "audio", _is_wav),
    ".ogg": ("audio/ogg", "audio", _is_ogg),
}

class AssetStorageEngine:
    def __init__(self, base_dir: Path = settings.ASSETS_DIR):
        self.base_dir = Path(base_dir).resolve()
        self.base_dir.mkdir(parents=True, exist_ok=True)

    @staticmethod
    def calculate_sha256(file_bytes: bytes) -> str:
        return hashlib.sha256(file_bytes).hexdigest()

    def validate_file(self, file_bytes: bytes, original_filename: str) -> Tuple[str, str, str]:
        """
        Validates size, extension, and content magic bytes.
        Never trusts user-supplied content types.
        Returns: (verified_mime_type, asset_category, safe_extension)
        """
        # 1. Size Validation
        if len(file_bytes) > settings.MAX_FILE_UPLOAD_BYTES:
            raise AppException(
                status_code=400,
                error_code="FILE_OVERSIZED",
                message=f"File exceeds maximum allowed upload size of {settings.MAX_FILE_UPLOAD_BYTES // (1024 * 1024)}MB."
            )

        if len(file_bytes) == 0:
            raise AppException(
                status_code=400,
                error_code="FILE_EMPTY",
                message="Cannot upload empty file."
            )

        # 2. Extension Validation
        raw_ext = Path(original_filename).suffix.lower()
        if raw_ext not in ALLOWED_FORMATS:
            allowed = ", ".join(ALLOWED_FORMATS.keys())
            raise AppException(
                status_code=400,
                error_code="UNSUPPORTED_MEDIA_TYPE",
                message=f"Unsupported file extension '{raw_ext}'. Allowed formats: {allowed}"
            )

        mime_type, category, validator_fn = ALLOWED_FORMATS[raw_ext]

        # 3. Magic Bytes Integrity Validation
        if not validator_fn(file_bytes):
            raise AppException(
                status_code=400,
                error_code="INVALID_FILE_SIGNATURE",
                message=f"File content does not match the claimed file type '{raw_ext}'. Upload rejected."
            )

        return mime_type, category, raw_ext

    def store_file(
        self,
        file_bytes: bytes,
        original_filename: str,
        organization_id: str = "default",
        product_id: Optional[str] = None
    ) -> Tuple[str, str, int]:
        """
        Stores file content deterministically by SHA-256 in a secure organization/product hierarchy.
        Protects against path traversal and unsafe filenames.
        Returns: (relative_file_path, content_hash, file_size_bytes)
        """
        mime_type, asset_type, safe_ext = self.validate_file(file_bytes, original_filename)
        content_hash = self.calculate_sha256(file_bytes)

        # Build secure, sanitized path
        safe_org = Path(organization_id).name
        if product_id:
            safe_prod = Path(product_id).name
            target_dir = (self.base_dir / safe_org / safe_prod).resolve()
        else:
            target_dir = (self.base_dir / safe_org).resolve()
        
        # Verify target is strictly within base_dir
        if not target_dir.is_relative_to(self.base_dir):
            raise AppException(
                status_code=400,
                error_code="PATH_TRAVERSAL_DETECTED",
                message="Invalid storage path location."
            )

        target_dir.mkdir(parents=True, exist_ok=True)
        safe_filename = f"{content_hash}{safe_ext}"
        target_path = (target_dir / safe_filename).resolve()

        if not target_path.is_relative_to(self.base_dir):
            raise AppException(
                status_code=400,
                error_code="PATH_TRAVERSAL_DETECTED",
                message="Target file path escapes base directory."
            )

        # Write if not already present (content-addressed deduplication)
        if not target_path.exists():
            with open(target_path, "wb") as f:
                f.write(file_bytes)

        relative_path = str(target_path.relative_to(self.base_dir))
        return relative_path, content_hash, len(file_bytes)

    def retrieve_file_bytes(self, relative_path: str) -> bytes:
        """Retrieves entire file bytes safely, guarding against path traversal."""
        full_path = self.resolve_safe_path(relative_path)
        with open(full_path, "rb") as f:
            return f.read()

    def resolve_safe_path(self, relative_path: str) -> Path:
        """
        Resolves relative path and strictly guards against directory traversal.
        """
        # Rejects relative paths with ../ or absolute paths
        if ".." in relative_path or relative_path.startswith("/") or relative_path.startswith("\\"):
            raise AppException(
                status_code=400,
                error_code="PATH_TRAVERSAL_DETECTED",
                message="Path traversal sequence detected."
            )

        full_path = (self.base_dir / relative_path).resolve()
        if not full_path.is_relative_to(self.base_dir):
            raise AppException(
                status_code=400,
                error_code="PATH_TRAVERSAL_DETECTED",
                message="Access forbidden: Path outside base directory."
            )

        if not full_path.exists():
            raise AppException(
                status_code=404,
                error_code="FILE_NOT_FOUND",
                message="Asset file not found on disk."
            )

        return full_path

    async def stream_file(self, relative_path: str, chunk_size: int = 65536) -> AsyncGenerator[bytes, None]:
        """
        Streams file in chunks to prevent large files from exhausting server RAM.
        """
        full_path = self.resolve_safe_path(relative_path)
        with open(full_path, "rb") as f:
            while True:
                chunk = f.read(chunk_size)
                if not chunk:
                    break
                yield chunk

    def delete_file_if_unreferenced(self, relative_path: str) -> bool:
        """
        Deletes physical file from disk safely if it exists.
        """
        try:
            full_path = self.resolve_safe_path(relative_path)
            if full_path.exists():
                full_path.unlink()
                return True
        except Exception:
            pass
        return False

storage_engine = AssetStorageEngine()

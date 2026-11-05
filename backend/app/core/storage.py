import hashlib
import shutil
from pathlib import Path
from typing import Tuple
from app.config import settings

class AssetStorageEngine:
    def __init__(self, base_dir: Path = settings.ASSETS_DIR):
        self.base_dir = base_dir
        self.base_dir.mkdir(parents=True, exist_ok=True)

    @staticmethod
    def calculate_sha256(file_bytes: bytes) -> str:
        return hashlib.sha256(file_bytes).hexdigest()

    def store_file(
        self,
        file_bytes: bytes,
        original_filename: str,
        product_slug: str
    ) -> Tuple[str, str, int]:
        """
        Stores file content deterministically by SHA-256.
        Returns (relative_file_path, content_hash, file_size_bytes)
        """
        content_hash = self.calculate_sha256(file_bytes)
        extension = Path(original_filename).suffix.lower()
        product_dir = self.base_dir / product_slug
        product_dir.mkdir(parents=True, exist_ok=True)
        
        stored_filename = f"{content_hash}{extension}"
        target_path = product_dir / stored_filename
        
        # Write only if not already present (content-addressed deduplication)
        if not target_path.exists():
            with open(target_path, "wb") as f:
                f.write(file_bytes)
                
        relative_path = str(target_path.relative_to(self.base_dir))
        return relative_path, content_hash, len(file_bytes)

    def retrieve_file_bytes(self, relative_path: str) -> bytes:
        absolute_path = self.base_dir / relative_path
        if not absolute_path.exists():
            raise FileNotFoundError(f"Media asset not found: {relative_path}")
        with open(absolute_path, "rb") as f:
            return f.read()

storage_engine = AssetStorageEngine()

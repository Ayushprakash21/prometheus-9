import pytest
from app.core.storage import AssetStorageEngine

def test_storage_engine_sha256_deduplication(tmp_path):
    engine = AssetStorageEngine(base_dir=tmp_path)
    sample_content = b"PROMETHEUS-9 Master Brand Creative Vector Asset 2026"
    
    path1, hash1, size1 = engine.store_file(sample_content, "brand.svg", "orion-9")
    path2, hash2, size2 = engine.store_file(sample_content, "duplicate_brand.svg", "orion-9")
    
    assert hash1 == hash2
    assert size1 == len(sample_content)
    # The same content hash produces the same stored file
    assert path1 == path2
    
    retrieved = engine.retrieve_file_bytes(path1)
    assert retrieved == sample_content

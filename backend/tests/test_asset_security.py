import uuid
import pytest
from httpx import AsyncClient
from app.core.storage import storage_engine
from app.core.exceptions import AppException

# Valid binary samples with authentic headers
PNG_SAMPLE = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
JPEG_SAMPLE = b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00`\x00`\x00\x00\xff\xdb\x00C\x00\xff\xd9"
MP4_SAMPLE = b"\x00\x00\x00\x18ftypmp42\x00\x00\x00\x00isommp42\x00\x00\x00\x08free"
MP3_SAMPLE = b"ID3\x04\x00\x00\x00\x00\x00#TSSE\x00\x00\x00\x0f\x00\x00\x03Lavf60.16.100\xff\xfb\x90d\x00\x00"
WAV_SAMPLE = b"RIFF$\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00D\xac\x00\x00\x88X\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00"

@pytest.mark.asyncio
async def test_valid_image_video_audio_upload_and_stream(client: AsyncClient, auth_headers: dict):
    # 1. Fetch Orion-9 ID
    orion_res = await client.get("/api/v1/products/orion-9", headers=auth_headers)
    assert orion_res.status_code == 200
    product_id = orion_res.json()["id"]

    # Upload Valid PNG
    png_res = await client.post(
        "/api/v1/assets/upload",
        data={"product_id": product_id, "asset_type": "image"},
        files={"file": ("diagram.png", PNG_SAMPLE, "image/png")},
        headers=auth_headers
    )
    assert png_res.status_code == 201
    png_id = png_res.json()["id"]
    assert png_res.json()["mime_type"] == "image/png"

    # Stream download PNG
    stream_res = await client.get(f"/api/v1/assets/{png_id}/download", headers=auth_headers)
    assert stream_res.status_code == 200
    assert stream_res.headers["content-type"] == "image/png"
    assert stream_res.content == PNG_SAMPLE

    # Upload Valid MP4 Video
    mp4_res = await client.post(
        "/api/v1/assets/upload",
        data={"product_id": product_id, "asset_type": "video"},
        files={"file": ("demo.mp4", MP4_SAMPLE, "video/mp4")},
        headers=auth_headers
    )
    assert mp4_res.status_code == 201
    assert mp4_res.json()["mime_type"] == "video/mp4"

    # Upload Valid MP3 Audio
    mp3_res = await client.post(
        "/api/v1/assets/upload",
        data={"product_id": product_id, "asset_type": "audio"},
        files={"file": ("voiceover.mp3", MP3_SAMPLE, "audio/mpeg")},
        headers=auth_headers
    )
    assert mp3_res.status_code == 201
    assert mp3_res.json()["mime_type"] == "audio/mpeg"

@pytest.mark.asyncio
async def test_unsupported_and_spoofed_file_rejected(client: AsyncClient, auth_headers: dict):
    orion_res = await client.get("/api/v1/products/orion-9", headers=auth_headers)
    product_id = orion_res.json()["id"]

    # 1. Unsupported extension (.exe)
    exe_res = await client.post(
        "/api/v1/assets/upload",
        data={"product_id": product_id, "asset_type": "document"},
        files={"file": ("malware.exe", b"MZ\x90\x00\x03\x00\x00\x00", "application/x-dosexec")},
        headers=auth_headers
    )
    assert exe_res.status_code == 400
    assert "unsupported" in exe_res.json()["detail"].lower()

    # 2. Spoofed extension: named .png but containing plain shell script
    spoofed_res = await client.post(
        "/api/v1/assets/upload",
        data={"product_id": product_id, "asset_type": "image"},
        files={"file": ("fake_image.png", b"#!/bin/bash\nrm -rf /", "image/png")},
        headers=auth_headers
    )
    assert spoofed_res.status_code == 400
    assert "signature" in spoofed_res.json()["detail"].lower() or "rejected" in spoofed_res.json()["detail"].lower()

@pytest.mark.asyncio
async def test_path_traversal_protection(client: AsyncClient, auth_headers: dict):
    """
    Ensure directory traversal attempts cannot escape the asset storage root.
    """
    # 1. Direct path traversal in resolve_safe_path
    with pytest.raises(AppException) as exc_info:
        storage_engine.resolve_safe_path("../../windows/system32/cmd.exe")
    assert exc_info.value.status_code == 400
    assert "PATH_TRAVERSAL" in exc_info.value.error_code

    with pytest.raises(AppException) as exc_info2:
        storage_engine.resolve_safe_path("/etc/passwd")
    assert exc_info2.value.status_code == 400

@pytest.mark.asyncio
async def test_duplicate_content_deduplication_and_safe_delete(client: AsyncClient, auth_headers: dict):
    orion_res = await client.get("/api/v1/products/orion-9", headers=auth_headers)
    product_id = orion_res.json()["id"]

    # Upload original JPEG
    res1 = await client.post(
        "/api/v1/assets/upload",
        data={"product_id": product_id, "asset_type": "image"},
        files={"file": ("banner_original.jpg", JPEG_SAMPLE, "image/jpeg")},
        headers=auth_headers
    )
    assert res1.status_code == 201
    asset1_id = res1.json()["id"]
    content_hash = res1.json()["content_hash"]

    # Upload duplicate with different filename
    res2 = await client.post(
        "/api/v1/assets/upload",
        data={"product_id": product_id, "asset_type": "image"},
        files={"file": ("banner_copy.jpg", JPEG_SAMPLE, "image/jpeg")},
        headers=auth_headers
    )
    assert res2.status_code == 201
    assert res2.json()["content_hash"] == content_hash
    # Same content hash returns existing asset (content-addressed deduplication)
    assert res2.json()["id"] == asset1_id

    # Safe delete asset
    del_res = await client.delete(f"/api/v1/assets/{asset1_id}", headers=auth_headers)
    assert del_res.status_code == 200

    # Ensure subsequent download returns 404
    get_res = await client.get(f"/api/v1/assets/{asset1_id}/download", headers=auth_headers)
    assert get_res.status_code == 404

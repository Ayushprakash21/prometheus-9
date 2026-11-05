import uuid
import pytest
from httpx import AsyncClient
from app.security.passwords import hash_password, verify_password

def test_argon2id_hashing_and_verification():
    raw_password = "SuperSecret_Argon2id_Password_2026!"
    hashed = hash_password(raw_password)
    assert hashed.startswith("$argon2id$")
    assert verify_password(raw_password, hashed) is True
    assert verify_password("WrongPassword123!", hashed) is False

@pytest.mark.asyncio
async def test_auth_registration_flow(client: AsyncClient):
    unique = str(uuid.uuid4())[:8]
    email = f"lead_{unique}@prometheus9.ai"
    password = "SecurePassword_2026!#"
    
    payload = {
        "email": email,
        "password": password,
        "full_name": "Test Lead Engineer",
        "organization_name": f"Enterprise Corp {unique}"
    }
    
    reg_res = await client.post("/api/v1/auth/register", json=payload)
    assert reg_res.status_code == 201
    data = reg_res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user_id"] is not None
    assert data["active_organization_id"] is not None
    
    # Verify login with registered credentials
    login_payload = {
        "email": email,
        "password": password
    }
    login_res = await client.post("/api/v1/auth/login", json=login_payload)
    assert login_res.status_code == 200
    token_data = login_res.json()
    token = token_data["access_token"]
    
    # Verify /me endpoint
    headers = {"Authorization": f"Bearer {token}"}
    me_res = await client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["email"] == email
    assert len(me_data["memberships"]) == 1
    assert me_data["memberships"][0]["role"] == "owner"

@pytest.mark.asyncio
async def test_auth_login_failure_cases(client: AsyncClient):
    # Wrong password
    wrong_pw_res = await client.post("/api/v1/auth/login", json={
        "email": "founder@prometheus9.ai",
        "password": "CompletelyWrongPassword!"
    })
    assert wrong_pw_res.status_code == 401
    assert "Invalid email or password" in wrong_pw_res.json()["detail"]
    
    # Non-existent user
    non_existent_res = await client.post("/api/v1/auth/login", json={
        "email": "nonexistent_ghost_user@prometheus9.ai",
        "password": "Password123!"
    })
    assert non_existent_res.status_code == 401

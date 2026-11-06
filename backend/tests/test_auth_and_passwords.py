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

@pytest.mark.asyncio
async def test_initial_admin_bootstrap_and_forced_password_change(client: AsyncClient):
    import sqlite3
    from app.config import settings
    try:
        # 1. Login with seeded initial development credentials
        login_res = await client.post("/api/v1/auth/login", json={
            "email": "ayush@admin",
            "password": "admin"
        })
        assert login_res.status_code == 200
        login_data = login_res.json()
        assert login_data["must_change_password"] is True
        token = login_data["access_token"]
        
        # 2. Change password
        headers = {"Authorization": f"Bearer {token}"}
        change_res = await client.post("/api/v1/auth/change-password", headers=headers, json={
            "old_password": "admin",
            "new_password": "AyushVerifiedPass2026!#"
        })
        assert change_res.status_code == 200
        change_data = change_res.json()
        assert change_data["must_change_password"] is False
        new_token = change_data["access_token"]

        # 3. Old initial password must now be rejected
        old_login_res = await client.post("/api/v1/auth/login", json={
            "email": "ayush@admin",
            "password": "admin"
        })
        assert old_login_res.status_code == 401

        # 4. New password must authenticate successfully
        new_login_res = await client.post("/api/v1/auth/login", json={
            "email": "ayush@admin",
            "password": "AyushVerifiedPass2026!#"
        })
        assert new_login_res.status_code == 200
        assert new_login_res.json()["must_change_password"] is False

        # 5. Test logout
        logout_res = await client.post("/api/v1/auth/logout", headers={"Authorization": f"Bearer {new_token}"})
        assert logout_res.status_code == 200
    finally:
        # 6. Always reset back to admin with must_change_password=True for consistent dev environment
        con = sqlite3.connect(str(settings.SQLITE_DB_PATH))
        con.execute("UPDATE users SET hashed_password = ?, must_change_password = 1 WHERE email = 'ayush@admin'", (hash_password("admin"),))
        con.commit()
        con.close()

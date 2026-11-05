import pytest
from app.core.security import (
    encrypt_oauth_token, decrypt_oauth_token,
    create_access_token, decode_access_token,
    get_password_hash, verify_password
)

def test_oauth_token_encryption_and_decryption():
    raw_token = "ya29.a0AfH6SMDh_SuperSecretGoogleOAuth2TokenForYouTubeUploads"
    encrypted = encrypt_oauth_token(raw_token)
    assert encrypted != raw_token
    assert len(encrypted) > 20
    
    decrypted = decrypt_oauth_token(encrypted)
    assert decrypted == raw_token

def test_jwt_access_token_creation_and_decode():
    token = create_access_token(subject="founder-admin-1")
    payload = decode_access_token(token)
    assert payload is not None
    assert payload["sub"] == "founder-admin-1"

def test_password_hashing():
    pwd = "Prometheus9_MasterSecurePassword"
    hashed = get_password_hash(pwd)
    assert verify_password(pwd, hashed) is True
    assert verify_password("WrongPassword", hashed) is False

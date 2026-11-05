import base64
import hashlib
from typing import Optional, Any
from datetime import timedelta
from cryptography.fernet import Fernet
from app.config import settings
from app.security.passwords import hash_password, verify_password
from app.security.tokens import create_access_token, decode_access_token

def _get_fernet_key() -> bytes:
    digest = hashlib.sha256(settings.SECRET_KEY.encode()).digest()
    return base64.urlsafe_b64encode(digest)

fernet = Fernet(_get_fernet_key())

def get_password_hash(password: str) -> str:
    """Argon2id password hashing."""
    return hash_password(password)

def encrypt_oauth_token(token_str: str) -> str:
    if not token_str:
        return ""
    return fernet.encrypt(token_str.encode()).decode()

def decrypt_oauth_token(encrypted_token_str: str) -> str:
    if not encrypted_token_str:
        return ""
    return fernet.decrypt(encrypted_token_str.encode()).decode()

__all__ = [
    "verify_password",
    "get_password_hash",
    "hash_password",
    "create_access_token",
    "decode_access_token",
    "encrypt_oauth_token",
    "decrypt_oauth_token"
]

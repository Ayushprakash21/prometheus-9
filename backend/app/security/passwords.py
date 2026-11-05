from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, InvalidHashError
import bcrypt

ph = PasswordHasher(
    time_cost=2,
    memory_cost=19456,  # 19 MiB
    parallelism=1,
    hash_len=32,
    salt_len=16
)

def hash_password(password: str) -> str:
    """Hashes password securely with Argon2id."""
    return ph.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies plain password against hash.
    Supports Argon2id primary and bcrypt fallback for legacy hashes.
    """
    if hashed_password.startswith("$argon2"):
        try:
            return ph.verify(hashed_password, plain_password)
        except (VerifyMismatchError, InvalidHashError):
            return False
    elif hashed_password.startswith("$2b$") or hashed_password.startswith("$2a$"):
        try:
            return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
        except Exception:
            return False
    return False

import re
from typing import Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.system import User, Organization, OrganizationMembership
from app.schemas.auth import UserRegister, UserLogin, TokenResponse, UserOut
from app.security.passwords import hash_password, verify_password
from app.security.tokens import create_access_token, decode_access_token
from app.core.exceptions import ConflictException, UnauthorizedException, BadRequestException
from app.services.audit import record_audit_event
from app.config import settings

def slugify(text: str) -> str:
    s = text.lower().strip()
    s = re.sub(r"[^\w\s-]", "", s)
    s = re.sub(r"[\s_-]+", "-", s)
    return s or "org"

class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def register(self, payload: UserRegister, ip_address: Optional[str] = None) -> Tuple[User, Organization, str]:
        # Check existing email
        existing = await self.db.execute(select(User).where(User.email == payload.email.lower()))
        if existing.scalar_one_or_none():
            raise ConflictException(f"User with email '{payload.email}' already exists.")

        # Hash password securely with Argon2id
        hashed_pwd = hash_password(payload.password)
        
        user = User(
            email=payload.email.lower(),
            hashed_password=hashed_pwd,
            full_name=payload.full_name,
            is_active=True,
            is_superuser=False,
            must_change_password=False
        )
        self.db.add(user)
        await self.db.flush()

        # Create Organization
        org_name = payload.organization_name or f"{user.full_name or 'User'}'s Organization"
        org_slug = slugify(org_name)
        
        # Ensure unique slug
        slug_res = await self.db.execute(select(Organization).where(Organization.slug == org_slug))
        if slug_res.scalar_one_or_none():
            org_slug = f"{org_slug}-{user.id[:8]}"

        org = Organization(
            name=org_name,
            slug=org_slug
        )
        self.db.add(org)
        await self.db.flush()

        # Create OrganizationMembership (Owner role)
        membership = OrganizationMembership(
            organization_id=org.id,
            user_id=user.id,
            role="owner"
        )
        self.db.add(membership)
        await self.db.commit()
        await self.db.refresh(user)
        await self.db.refresh(org)

        # Audit
        await record_audit_event(
            db=self.db,
            actor_id=user.id,
            actor_type="user",
            action="USER_REGISTERED",
            resource_type="user",
            resource_id=user.id,
            organization_id=org.id,
            details={"email": user.email, "org_name": org.name},
            ip_address=ip_address
        )

        token = create_access_token(
            subject=user.id,
            extra_claims={"org_id": org.id, "email": user.email}
        )
        return user, org, token

    async def login(self, payload: UserLogin, ip_address: Optional[str] = None) -> TokenResponse:
        result = await self.db.execute(select(User).where(User.email == payload.email.lower()))
        user = result.scalar_one_or_none()

        if not user or not verify_password(payload.password, user.hashed_password):
            # Record failed login attempt in audit log
            await record_audit_event(
                db=self.db,
                actor_id=user.id if user else "anonymous",
                actor_type="user",
                action="LOGIN_FAILURE",
                resource_type="auth",
                details={"attempted_email": payload.email},
                ip_address=ip_address
            )
            raise UnauthorizedException("Invalid email or password.")

        if not user.is_active:
            raise UnauthorizedException("Account is deactivated.")

        # Find primary organization
        mem_res = await self.db.execute(
            select(OrganizationMembership)
            .where(OrganizationMembership.user_id == user.id)
            .order_by(OrganizationMembership.created_at.asc())
        )
        primary_mem = mem_res.scalar_one_or_none()
        org_id = primary_mem.organization_id if primary_mem else ""

        token = create_access_token(
            subject=user.id,
            extra_claims={"org_id": org_id, "email": user.email}
        )

        # Record successful login
        await record_audit_event(
            db=self.db,
            actor_id=user.id,
            actor_type="user",
            action="LOGIN_SUCCESS",
            resource_type="auth",
            organization_id=org_id,
            ip_address=ip_address
        )

        return TokenResponse(
            access_token=token,
            token_type="bearer",
            expires_in_minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES,
            user_id=user.id,
            active_organization_id=org_id,
            must_change_password=getattr(user, "must_change_password", False)
        )

    async def change_password(self, user_id: str, old_password: str, new_password: str, ip_address: Optional[str] = None) -> TokenResponse:
        user = (await self.db.execute(select(User).where(User.id == user_id))).scalar_one_or_none()
        if not user:
            raise UnauthorizedException("User not found.")
        if not verify_password(old_password, user.hashed_password):
            raise UnauthorizedException("Current password is incorrect.")
        if old_password == new_password:
            raise BadRequestException("New password must be different from your current password.")

        user.hashed_password = hash_password(new_password)
        user.must_change_password = False
        await self.db.commit()
        await self.db.refresh(user)

        # Find primary organization
        mem_res = await self.db.execute(
            select(OrganizationMembership)
            .where(OrganizationMembership.user_id == user.id)
            .order_by(OrganizationMembership.created_at.asc())
        )
        primary_mem = mem_res.scalar_one_or_none()
        org_id = primary_mem.organization_id if primary_mem else ""

        await record_audit_event(
            db=self.db,
            actor_id=user.id,
            actor_type="user",
            action="PASSWORD_CHANGED",
            resource_type="auth",
            organization_id=org_id,
            ip_address=ip_address
        )

        token = create_access_token(
            subject=user.id,
            extra_claims={"org_id": org_id, "email": user.email}
        )

        return TokenResponse(
            access_token=token,
            token_type="bearer",
            expires_in_minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES,
            user_id=user.id,
            active_organization_id=org_id,
            must_change_password=False
        )

    async def request_password_reset(self, email: str, ip_address: Optional[str] = None) -> dict:
        user = (await self.db.execute(select(User).where(User.email == email.lower()))).scalar_one_or_none()
        if user:
            # Generate a secure short-lived reset token (valid 15 mins)
            reset_token = create_access_token(
                subject=user.id,
                extra_claims={"type": "password_reset", "email": user.email}
            )
            await record_audit_event(
                db=self.db,
                actor_id=user.id,
                actor_type="user",
                action="PASSWORD_RESET_REQUESTED",
                resource_type="auth",
                ip_address=ip_address
            )
            return {"message": "Password reset instructions generated.", "reset_token": reset_token}
        return {"message": "If that email exists in our records, password reset instructions have been generated."}

    async def reset_password(self, token: str, new_password: str, ip_address: Optional[str] = None) -> dict:
        payload = decode_access_token(token)
        if not payload or payload.get("type") != "password_reset":
            raise UnauthorizedException("Invalid or expired password reset token.")
        
        user_id = payload.get("sub")
        user = (await self.db.execute(select(User).where(User.id == user_id))).scalar_one_or_none()
        if not user:
            raise UnauthorizedException("User not found.")

        user.hashed_password = hash_password(new_password)
        user.must_change_password = False
        await self.db.commit()

        await record_audit_event(
            db=self.db,
            actor_id=user.id,
            actor_type="user",
            action="PASSWORD_RESET_COMPLETED",
            resource_type="auth",
            ip_address=ip_address
        )
        return {"message": "Password reset successfully. You may now sign in with your new password."}

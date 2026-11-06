from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.session import get_db
from app.models.system import User, OrganizationMembership, Organization
from app.schemas.auth import (
    UserRegister, 
    UserLogin, 
    TokenResponse, 
    UserOut, 
    OrganizationMembershipOut,
    ChangePasswordRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest
)
from app.services.auth import AuthService
from app.security.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication & Access"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(
    payload: UserRegister,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    service = AuthService(db)
    user, org, token = await service.register(payload, ip_address=request.client.host if request.client else None)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        expires_in_minutes=10080,
        user_id=user.id,
        active_organization_id=org.id,
        must_change_password=False
    )

@router.post("/login", response_model=TokenResponse)
async def login(
    payload: UserLogin,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    service = AuthService(db)
    return await service.login(payload, ip_address=request.client.host if request.client else None)

@router.post("/change-password", response_model=TokenResponse)
async def change_password(
    payload: ChangePasswordRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = AuthService(db)
    return await service.change_password(
        user_id=current_user.id,
        old_password=payload.old_password,
        new_password=payload.new_password,
        ip_address=request.client.host if request.client else None
    )

@router.post("/forgot-password")
async def forgot_password(
    payload: ForgotPasswordRequest,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    service = AuthService(db)
    return await service.request_password_reset(
        email=payload.email,
        ip_address=request.client.host if request.client else None
    )

@router.post("/reset-password")
async def reset_password(
    payload: ResetPasswordRequest,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    service = AuthService(db)
    return await service.reset_password(
        token=payload.token,
        new_password=payload.new_password,
        ip_address=request.client.host if request.client else None
    )

@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_user)
):
    return {"message": "Successfully logged out. Session terminated."}

@router.get("/me", response_model=UserOut)
async def get_me(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Load memberships with organization names
    stmt = (
        select(OrganizationMembership, Organization.name)
        .join(Organization, OrganizationMembership.organization_id == Organization.id)
        .where(OrganizationMembership.user_id == current_user.id)
    )
    result = await db.execute(stmt)
    rows = result.all()
    
    membership_outs = [
        OrganizationMembershipOut(
            id=mem.id,
            organization_id=mem.organization_id,
            organization_name=org_name,
            role=mem.role,
            created_at=mem.created_at
        )
        for mem, org_name in rows
    ]

    return UserOut(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        is_active=current_user.is_active,
        is_superuser=current_user.is_superuser,
        must_change_password=getattr(current_user, "must_change_password", False),
        created_at=current_user.created_at,
        memberships=membership_outs
    )

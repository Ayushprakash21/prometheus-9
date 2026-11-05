from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.database.session import get_db
from app.models.system import User, OrganizationMembership, Organization
from app.schemas.auth import UserRegister, UserLogin, TokenResponse, UserOut, OrganizationMembershipOut
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
        active_organization_id=org.id
    )

@router.post("/login", response_model=TokenResponse)
async def login(
    payload: UserLogin,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    service = AuthService(db)
    return await service.login(payload, ip_address=request.client.host if request.client else None)

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
        created_at=current_user.created_at,
        memberships=membership_outs
    )

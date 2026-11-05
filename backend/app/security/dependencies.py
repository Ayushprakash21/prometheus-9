from typing import Optional, List, Tuple
from fastapi import Depends, Header, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.session import get_db
from app.models.system import User, Organization, OrganizationMembership
from app.security.tokens import decode_access_token
from app.core.exceptions import UnauthorizedException, ForbiddenException
from app.services.audit import record_audit_event

security = HTTPBearer(auto_error=False)

async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    if not credentials:
        raise UnauthorizedException("Missing authentication token")
    
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise UnauthorizedException("Invalid or expired authentication token")
    
    user_id = payload["sub"]
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise UnauthorizedException("User account associated with this token does not exist")
    if not user.is_active:
        raise ForbiddenException("User account is inactive")
        
    return user

async def get_current_active_org(
    request: Request,
    current_user: User = Depends(get_current_user),
    x_organization_id: Optional[str] = Header(None, alias="X-Organization-Id"),
    db: AsyncSession = Depends(get_db)
) -> Tuple[Organization, OrganizationMembership]:
    """
    Resolves the active organization for the request.
    Strictly enforces that current_user has a valid OrganizationMembership in the target org.
    Prevents cross-organization data access at the API/service boundary.
    """
    if x_organization_id:
        query = (
            select(Organization, OrganizationMembership)
            .join(OrganizationMembership, Organization.id == OrganizationMembership.organization_id)
            .where(
                Organization.id == x_organization_id,
                OrganizationMembership.user_id == current_user.id
            )
        )
        result = await db.execute(query)
        row = result.first()
        if not row:
            # Audit permission failure
            await record_audit_event(
                db=db,
                actor_id=current_user.id,
                actor_type="user",
                action="PERMISSION_FAILURE_CROSS_ORG",
                resource_type="organization",
                organization_id=x_organization_id,
                details={"reason": "User is not a member of the requested organization"},
                ip_address=request.client.host if request.client else None
            )
            raise ForbiddenException(f"You are not authorized to access organization '{x_organization_id}'")
        return row[0], row[1]
    
    # Fallback to user's first/primary organization
    query = (
        select(Organization, OrganizationMembership)
        .join(OrganizationMembership, Organization.id == OrganizationMembership.organization_id)
        .where(OrganizationMembership.user_id == current_user.id)
        .order_by(OrganizationMembership.created_at.asc())
    )
    result = await db.execute(query)
    row = result.first()
    if not row:
        raise ForbiddenException("User does not belong to any organization")
    return row[0], row[1]

def require_roles(allowed_roles: List[str]):
    def role_checker(
        org_and_membership: Tuple[Organization, OrganizationMembership] = Depends(get_current_active_org)
    ) -> Tuple[Organization, OrganizationMembership]:
        org, membership = org_and_membership
        if membership.role not in allowed_roles:
            raise ForbiddenException(
                f"Action requires one of the following roles: {allowed_roles}. Current role: {membership.role}"
            )
        return org, membership
    return role_checker

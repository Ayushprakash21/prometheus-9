from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: Optional[str] = None
    organization_name: Optional[str] = Field(default="My Organization", min_length=2)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in_minutes: int
    user_id: str
    active_organization_id: str

class OrganizationMembershipOut(BaseModel):
    id: str
    organization_id: str
    organization_name: str
    role: str
    created_at: datetime
    class Config:
        from_attributes = True

class UserOut(BaseModel):
    id: str
    email: str
    full_name: Optional[str]
    is_active: bool
    is_superuser: bool
    created_at: datetime
    memberships: List[OrganizationMembershipOut] = []
    class Config:
        from_attributes = True

class OrganizationOut(BaseModel):
    id: str
    name: str
    slug: str
    created_at: datetime
    class Config:
        from_attributes = True

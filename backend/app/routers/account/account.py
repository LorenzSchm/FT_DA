from typing import Dict, Any
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr

from app.dependencies import get_supabase

router = APIRouter(prefix="/account", tags=["account"])
auth_scheme = HTTPBearer(auto_error=True)

class UpdateUserRequest(BaseModel):
    data: Dict[str, Any]

class UserResponse(BaseModel):
    id: str
    display_name: str | None = None
    email: EmailStr
    email_confirmed_at: datetime | None = None
    created_at: datetime
    updated_at: datetime | None = None

@router.get("/user", response_model=UserResponse, status_code=status.HTTP_200_OK)
async def get_user(
    supabase = Depends(get_supabase),
    credentials: HTTPAuthorizationCredentials = Depends(auth_scheme),
):
    try:
        token = credentials.credentials
        resp = supabase.auth.get_user(token)
        if not resp or not resp.user:
            raise HTTPException(status_code=401, detail="Unauthorized: No valid session")

        u = resp.user
        return UserResponse(
            id=u.id,
            email=u.email,
            email_confirmed_at=getattr(u, "email_confirmed_at", None),
            display_name=u.user_metadata.get("display_name"),
            created_at=getattr(u, "created_at", None),
            updated_at=getattr(u, "updated_at", None),
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Get user failed: {e}")

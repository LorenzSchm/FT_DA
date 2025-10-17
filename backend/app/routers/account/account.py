from typing import Dict, Any
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from pydantic import BaseModel, EmailStr

from app.dependencies import get_supabase, get_user_token

router = APIRouter(prefix="/account", tags=["account"])
auth_scheme = HTTPBearer(auto_error=True)


class UpdateUserRequest(BaseModel):
    email: EmailStr | None = None
    display_name: str | None = None


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
    credentials = Depends(get_user_token)
):
    try:
        resp = supabase.auth.get_user(credentials)
        if not resp or not resp.user:
            raise HTTPException(status_code=401, detail="Unauthorized: No valid session")

        u = resp.user
        return UserResponse(
            id=u.id,
            email=u.email,
            email_confirmed_at=getattr(u, "email_confirmed_at", None),
            display_name=(u.user_metadata.get("display_name") if isinstance(u.user_metadata, dict) else None),
            created_at=getattr(u, "created_at", None),
            updated_at=getattr(u, "updated_at", None),
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Get user failed: {e}")


@router.patch("/user", response_model=UserResponse, status_code=status.HTTP_200_OK)
async def update_user(
    request: UpdateUserRequest,
    supabase = Depends(get_supabase),
    token: str = Depends(lambda credentials=Depends(auth_scheme): credentials.credentials),
):
    try:
        if not request.email and not request.display_name:
            raise HTTPException(status_code=400, detail="No update requested")
        resp = supabase.auth.update_user(token, {
            "email": request.email,
            "options": {
                "data": {
                    "display_name": request.display_name
                }
            }
        })
        if not resp or not resp.user:
            raise HTTPException(status_code=401, detail="Unauthorized: No valid session")
        return UserResponse(
            id=resp.user.id,
            email=resp.user.email,
            email_confirmed_at=getattr(resp.user, "email_confirmed_at", None),
            display_name=(resp.user.user_metadata.get("display_name") if isinstance(resp.user.user_metadata, dict) else None),
            created_at=getattr(resp.user, "created_at", None),
            updated_at=getattr(resp.user, "updated_at", None),
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Update user failed: {e}")

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
    currency: str | None = None
    refresh_token: str


class UserResponse(BaseModel):
    id: str
    display_name: str | None = None
    email: EmailStr
    currency: str | None = None
    email_confirmed_at: datetime | None = None
    created_at: datetime
    updated_at: datetime | None = None


@router.get("/", response_model=UserResponse, status_code=status.HTTP_200_OK)
async def get_user(
        supabase=Depends(get_supabase),
        credentials=Depends(get_user_token)
):
    try:
        resp = supabase.auth.get_user(credentials.get("access_token"))
        if not resp or not resp.user:
            raise HTTPException(status_code=401, detail="Unauthorized: No valid session")

        u = resp.user
        return UserResponse(
            id=u.id,
            email=u.email,
            email_confirmed_at=getattr(u, "email_confirmed_at", None),
            display_name=(u.user_metadata.get("display_name") if isinstance(u.user_metadata, dict) else None),
            currency=(u.user_metadata.get("currency") if isinstance(u.user_metadata, dict) else None),
            created_at=getattr(u, "created_at", None),
            updated_at=getattr(u, "updated_at", None),
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Get user failed: {e}")


@router.patch("/", response_model=UserResponse, status_code=status.HTTP_200_OK)
async def update_user(
        request: UpdateUserRequest,
        supabase=Depends(get_supabase),
        credentials: str = Depends(get_user_token),
):
    try:
        if not request.email and not request.display_name and not request.currency:
            raise HTTPException(status_code=400, detail="No update requested")

        supabase.auth.set_session(credentials.get("access_token"), request.refresh_token)

        update_payload: Dict[str, Any] = {}
        if request.email:
            update_payload["email"] = request.email

        data: Dict[str, Any] = {}
        if request.display_name is not None:
            data["display_name"] = request.display_name
        if request.currency is not None:
            data["currency"] = request.currency
        if data:
            update_payload["data"] = data

        resp = supabase.auth.update_user(update_payload)
        if not resp or not resp.user:
            raise HTTPException(status_code=401, detail="Unauthorized: No valid session")
        return UserResponse(
            id=resp.user.id,
            email=resp.user.email,
            email_confirmed_at=getattr(resp.user, "email_confirmed_at", None),
            display_name=(
                resp.user.user_metadata.get("display_name") if isinstance(resp.user.user_metadata, dict) else None),
            currency=(
                resp.user.user_metadata.get("currency") if isinstance(resp.user.user_metadata, dict) else None),
            created_at=getattr(resp.user, "created_at", None),
            updated_at=getattr(resp.user, "updated_at", None),
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Update user failed: {e}")


class AiFlagResponse(BaseModel):
    ai_flag: bool


class UpdateAiFlagRequest(BaseModel):
    ai_flag: bool


@router.get("/ai-flag", response_model=AiFlagResponse, status_code=status.HTTP_200_OK)
async def get_ai_flag(
        supabase=Depends(get_supabase),
        credentials=Depends(get_user_token),
):
    try:
        resp = supabase.auth.get_user(credentials.get("access_token"))
        if not resp or not resp.user:
            raise HTTPException(status_code=401, detail="Unauthorized")

        user_id = resp.user.id

        row = (
            supabase.schema("core")
            .table("users")
            .select("ai_flag")
            .eq("id", user_id)
            .execute()
        )

        if row.data and len(row.data) > 0:
            return AiFlagResponse(ai_flag=bool(row.data[0].get("ai_flag", False)))

        return AiFlagResponse(ai_flag=False)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Get ai_flag failed: {e}")


@router.patch("/ai-flag", response_model=AiFlagResponse, status_code=status.HTTP_200_OK)
async def update_ai_flag(
        request: UpdateAiFlagRequest,
        supabase=Depends(get_supabase),
        credentials=Depends(get_user_token),
):
    try:
        resp = supabase.auth.get_user(credentials.get("access_token"))
        if not resp or not resp.user:
            raise HTTPException(status_code=401, detail="Unauthorized")

        user_id = resp.user.id

        result = (
            supabase.schema("core")
            .table("users")
            .update({"ai_flag": request.ai_flag})
            .eq("id", user_id)
            .execute()
        )

        if result.data and len(result.data) > 0:
            return AiFlagResponse(ai_flag=bool(result.data[0].get("ai_flag", False)))

        raise HTTPException(status_code=404, detail="User row not found in core.users")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Update ai_flag failed: {e}")


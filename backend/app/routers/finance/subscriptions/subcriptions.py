from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from starlette import status

from app.dependencies import get_supabase, get_user_token

router = APIRouter(prefix="/subscriptions", tags=["finance-subscriptions"])


class AddSubscriptionRequest(BaseModel):
    merchant: str
    amount_minor: int
    currency: str
    every_n: int = 1
    unit: str = "month"
    start_date: str
    auto_detected: bool = False
    active: bool = True
    category_id: Optional[str] = None
    next_due_date: Optional[str] = None


@router.get("/")
async def get_subscriptions(
        supabase=Depends(get_supabase),
        tokens=Depends(get_user_token),
):
    try:
        access = tokens.get("access_token")
        refresh = tokens.get("refresh_token")
        supabase.auth.set_session(access, refresh)
        user_resp = supabase.auth.get_user()
        user = user_resp.user

        if not user:
            raise HTTPException(status_code=401, detail="Unauthorized: No valid session")

        response = (
            supabase.schema("finance")
            .table("subscriptions")
            .select("*")
            .execute()
        )
        return {"user": user.model_dump(), "rows": response.data}

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/")
async def add_subscription(
        request: AddSubscriptionRequest,
        supabase=Depends(get_supabase),
        tokens=Depends(get_user_token),
):
    try:
        access = tokens.get("access_token")
        refresh = tokens.get("refresh_token")
        supabase.auth.set_session(access, refresh)
        user_resp = supabase.auth.get_user()
        user = user_resp.user

        if not user:
            raise HTTPException(status_code=401, detail="Unauthorized: No valid session")

        payload = request.model_dump(exclude_none=True)

        subscriptions_response = (
            supabase.schema("finance")
            .table("subscriptions")
            .insert({
                "user_id": user.id,
                **payload,
                "created_at": str(datetime.now()),
            })
            .execute()
        )
        return {"user": user.model_dump(), "rows": subscriptions_response.data}

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_subscription(
    id: str,
    supabase=Depends(get_supabase),
    tokens=Depends(get_user_token),
):
    try:
        access = tokens.get("access_token")
        refresh = tokens.get("refresh_token")
        supabase.auth.set_session(access, refresh)
        user_resp = supabase.auth.get_user()
        user = user_resp.user

        if not user:
            raise HTTPException(status_code=401, detail="Unauthorized: No valid session")

        subscription_response = (
            supabase.schema("finance")
            .table("subscriptions")
            .delete()
            .eq("id", id)
            .execute()
        )
        return {"user": user.model_dump(), "rows": subscription_response.data}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.patch("/{id}", status_code=status.HTTP_200_OK)
async def patch_subscription(
    id: str,
    request: AddSubscriptionRequest,
    supabase=Depends(get_supabase),
    tokens=Depends(get_user_token),
):
    try:
        access = tokens.get("access_token")
        refresh = tokens.get("refresh_token")
        supabase.auth.set_session(access, refresh)
        user_resp = supabase.auth.get_user()
        user = user_resp.user

        if not user:
            raise HTTPException(status_code=401, detail="Unauthorized: No valid session")

        payload = request.model_dump(exclude_none=True)
        subscription_response = (
            supabase.schema("finance")
            .table("subscriptions")
            .update(payload)
            .eq("id", id)
            .execute()
        )
        return {"user": user.model_dump(), "rows": subscription_response.data}

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from app.dependencies import get_supabase, get_user_token
from fastapi.security import HTTPBearer
from pydantic import BaseModel
from starlette import status
from datetime import date, datetime

router = APIRouter(prefix="/finance", tags=["finance"])
auth_scheme = HTTPBearer(auto_error=True)

from .transactions.transactions import router as transactions_router
from .subscriptions.subcriptions import router as subscriptions_router

router.include_router(transactions_router)
router.include_router(subscriptions_router)



class CreateFinanceAccountRequest(BaseModel):
    user_id: Optional[str] = None
    name: str
    institution: Optional[str] = None
    currency: str
    kind: str
    ext_conn_id: Optional[str] = None
    archived_at: Optional[str] = None


@router.get("/", status_code=status.HTTP_200_OK)
async def get_finance(supabase=Depends(get_supabase), tokens=Depends(get_user_token)):
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
            .table("accounts")
            .select("*")
            .eq("user_id", user.id)
            .execute()
        )

        data = response.data

        return {"user": user.model_dump(), "rows": data}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Get finance failed: {e}")

@router.post("/", status_code=status.HTTP_201_CREATED)
async def post_finance(
    request: CreateFinanceAccountRequest,
    supabase=Depends(get_supabase),
    tokens=Depends(get_user_token),
):
    try:
        access = tokens.get("access_token")
        refresh = tokens.get("refresh_token")

        supabase.auth.set_session(access, refresh)

        payload = request.model_dump(exclude_none=True)
        res = (
            supabase.schema("finance")
            .table("accounts")
            .insert(payload)
            .execute()
        )

        return res.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Post finance failed: {e}")

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_finance(
    id: str,
    supabase=Depends(get_supabase),
    tokens=Depends(get_user_token),
):
    try:
        access = tokens.get("access_token")
        refresh = tokens.get("refresh_token")
        supabase.auth.set_session(access, refresh)

        response = (
            supabase.schema("finance")
            .table("accounts")
            .delete()
            .eq("id", id)
            .execute()
        )
        return response.data

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Delete finance failed: {e}")

@router.patch("/{id}", status_code=status.HTTP_200_OK)
async def patch_finance(
    id: str,
    request: CreateFinanceAccountRequest,
    supabase=Depends(get_supabase),
    tokens=Depends(get_user_token),
):
    try:
        access = tokens.get("access_token")
        refresh = tokens.get("refresh_token")

        supabase.auth.set_session(access, refresh)

        payload = request.model_dump(exclude_none=True)  # convert to dict
        resp = (
            supabase.schema("finance")
            .table("accounts")
            .update(payload)
            .eq("id", id)
            .execute()
        )

        return resp.data

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Patch finance failed: {e}")

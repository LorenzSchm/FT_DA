from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from starlette import status

from app.dependencies import get_supabase, get_user_token

router = APIRouter(prefix="/transactions", tags=["finance-transactions"])


class TransactionRequest(BaseModel):
    type: str
    amount_minor: float | str
    currency: str
    description: Optional[str] = None
    merchant: Optional[str] = None


@router.post("/{account_id}", status_code=status.HTTP_201_CREATED)
async def add_transactions(
    request: TransactionRequest,
    account_id: str,
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

        transactions_response = (
            supabase.schema("finance")
            .table("transactions")
            .insert(
                {
                    "user_id": user.id,
                    "account_id": account_id,
                    "txn_date": str(datetime.now().date()),
                    "source": "manual",
                    "created_at": str(datetime.now()),
                    **payload,
                }
            )
            .execute()
        )
        return {"user": user.model_dump(), "rows": transactions_response.data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Add transaction failed: {e}")


@router.get("/{account_id}", status_code=status.HTTP_200_OK)
async def get_transactions(
    supabase=Depends(get_supabase),
    tokens=Depends(get_user_token),
    account_id: str | None = None,
):
    try:
        access = tokens.get("access_token")
        refresh = tokens.get("refresh_token")

        supabase.auth.set_session(access, refresh)

        user_resp = supabase.auth.get_user()
        user = user_resp.user

        if not user:
            raise HTTPException(status_code=401, detail="Unauthorized: No valid session")

        if not account_id:
            raise HTTPException(status_code=400, detail="Missing account_id")

        transactions_response = (
            supabase.schema("finance")
            .table("transactions")
            .select("*")
            .eq("account_id", account_id)
            .execute()
        )

        return {"user": user.model_dump(), "rows": transactions_response.data}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Get transactions failed: {e}")


@router.delete("/{account_id}/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_transaction(
    id: str,
    account_id: str,
    supabase=Depends(get_supabase),
    tokens=Depends(get_user_token),
):
    try:
        access = tokens.get("access_token")
        refresh = tokens.get("refresh_token")

        supabase.auth.set_session(access, refresh)

        response = (
            supabase.schema("finance")
            .table("transactions")
            .delete()
            .eq("id", id)
            .execute()
        )
        return response.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Delete transaction failed: {e}")

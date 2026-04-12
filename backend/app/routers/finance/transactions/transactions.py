from datetime import datetime
from typing import Optional
import csv
import io

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
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
    category_id: Optional[str] = None


def _build_category_map(supabase, category_ids: list[str]) -> dict:
    """Fetch categories by IDs and return a lookup dict {id: {name, icon}}."""
    if not category_ids:
        return {}
    try:
        resp = (
            supabase.schema("finance")
            .table("categories")
            .select("id, name, icon, is_income")
            .in_("id", category_ids)
            .execute()
        )
        return {c["id"]: c for c in (resp.data or [])}
    except Exception:
        return {}


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


@router.get("/export/csv", status_code=status.HTTP_200_OK)
async def export_transactions_csv(
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

        accounts_response = (
            supabase.schema("finance")
            .table("accounts")
            .select("id, name, currency")
            .eq("user_id", user.id)
            .execute()
        )
        accounts = accounts_response.data or []
        account_map = {acc["id"]: acc for acc in accounts}
        account_ids = list(account_map.keys())

        transactions = []
        subscriptions = []
        if account_ids:
            transactions_response = (
                supabase.schema("finance")
                .table("transactions")
                .select("*")
                .in_("account_id", account_ids)
                .order("txn_date", desc=True)
                .execute()
            )
            transactions = transactions_response.data or []

            subscriptions_response = (
                supabase.schema("finance")
                .table("subscriptions")
                .select("*")
                .in_("account_id", account_ids)
                .execute()
            )
            subscriptions = subscriptions_response.data or []

        # Build category name lookup
        all_category_ids = list({
            t["category_id"] for t in transactions + subscriptions
            if t.get("category_id")
        })
        category_map = _build_category_map(supabase, all_category_ids)

        output = io.StringIO()
        writer = csv.writer(output)

        writer.writerow([
            "Account Name",
            "Account Currency",
            "Date",
            "Description",
            "Merchant",
            "Category",
            "Amount (Minor)",
            "Currency",
            "Type"
        ])

        for txn in transactions:
            acc = account_map.get(txn.get("account_id"), {})
            cat_id = txn.get("category_id", "")
            cat_name = category_map.get(cat_id, {}).get("name", cat_id) if cat_id else ""
            writer.writerow([
                acc.get("name", "Unknown Account"),
                acc.get("currency", ""),
                txn.get("txn_date", ""),
                txn.get("description", ""),
                txn.get("merchant", ""),
                cat_name,
                txn.get("amount_minor", 0),
                txn.get("currency", ""),
                txn.get("type", "")
            ])

        for sub in subscriptions:
            acc = account_map.get(sub.get("account_id"), {})
            cat_id = sub.get("category_id", "")
            cat_name = category_map.get(cat_id, {}).get("name", cat_id) if cat_id else ""
            writer.writerow([
                acc.get("name", "Unknown Account"),
                acc.get("currency", ""),
                sub.get("start_date", ""),
                f"Subscription ({sub.get('every_n', 1)} {sub.get('unit', 'month')})",
                sub.get("merchant", ""),
                cat_name,
                -abs(int(sub.get("amount_minor", 0))),
                sub.get("currency", ""),
                "subscription"
            ])

        return Response(
            content=output.getvalue(),
            media_type="text/csv",
            headers={"Content-Disposition": 'attachment; filename="transactions_export.csv"'}
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Export CSV failed: {e}")


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
        transactions = transactions_response.data or []

        # Enrich with category name + icon
        category_ids = list({t["category_id"] for t in transactions if t.get("category_id")})
        category_map = _build_category_map(supabase, category_ids)

        for txn in transactions:
            cat_id = txn.get("category_id")
            txn["category"] = category_map.get(cat_id) if cat_id else None

        return {"user": user.model_dump(), "rows": transactions}

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

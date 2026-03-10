from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer
from app.dependencies import get_supabase, get_user_token
from .contributions.contributions import router as contributions_router
from pydantic import BaseModel
from starlette import status

router = APIRouter(prefix="/saving-goals", tags=["finance"])
auth_scheme = HTTPBearer(auto_error=True)
router.include_router(contributions_router)

class SavingGoalRequest(BaseModel):
    name: str
    target_minor: int
    currency: str
    contributed_minor: int | None = None

@router.get("/")
async def get_saving_goals(
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
            .table("saving_goals")
            .select("*")
            .eq("user_id", user.id)
            .execute()
        )

        if response.data:
            for goal in response.data:
                contributions = (
                    supabase.schema("finance")
                    .table("saving_contributions")
                    .select("*")
                    .eq("goal_id", goal["id"])
                    .execute()
                )
                total_contributed = sum(c["contributed_minor"] for c in contributions.data) if contributions.data else 0
                goal["contributed_minor"] = total_contributed
                goal["contributions"] = contributions.data

        return {"user": user.model_dump(), "goals": response.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"qAdd transaction failed: {e}")


@router.post("/", status_code=status.HTTP_201_CREATED)
async def add_saving_goal(
        request: SavingGoalRequest,
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
        contributed_minor = payload.pop("contributed_minor", 0)

        response = (
            supabase.schema("finance")
            .table("saving_goals")
            .insert(
                {
                    "user_id": user.id,
                    **payload,
                }
            )
            .execute()
        )

        if response.data and contributed_minor > 0:
            goal_id = response.data[0]["id"]
            (
                supabase.schema("finance")
                .table("saving_contributions")
                .insert(
                    {
                        "goal_id": goal_id,
                        "contributed_minor": contributed_minor,
                        "description": "Initial balance",
                        "contributed_at": str(datetime.now()),
                    }
                )
                .execute()
            )

        return {"user": user.model_dump(), "rows": response.data}

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Add transaction failed: {e}")

@router.delete("/{id}")
async def delete_saving_goal(
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

        delete_response = (
            supabase.schema("finance")
            .table("saving_goals")
            .delete()
            .eq("id", id)
            .execute()
        )

        return {"user": user.model_dump(), "rows": delete_response.data}

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Add transaction failed: {e}")

@router.patch("/{id}")
async def update_saving_goal(
        id: str,
        request: SavingGoalRequest,
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

        response = (
            supabase.schema("finance")
            .table("saving_goals")
            .update(payload)
            .eq("id", id)
            .execute()
        )

        return {"user": user.model_dump(), "rows": response.data}

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Update transaction failed: {e}")
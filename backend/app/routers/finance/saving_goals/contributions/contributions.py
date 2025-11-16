from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer
from app.dependencies import get_supabase, get_user_token
from pydantic import BaseModel
from starlette import status

router = APIRouter(prefix="/contributions", tags=["finance"])
auth_scheme = HTTPBearer(auto_error=True)

class ContributionRequest(BaseModel):
    goal_id: str
    contributed_minor: int

@router.post("/")
async def add_contribution(
        request: ContributionRequest,
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
        contributions_response = (
            supabase.schema("finance")
            .table("saving_contributions")
            .insert(
                {
                    **payload,
                    "contributed_at": str(datetime.now()),
                }
            )
            .execute()
        )
        return {"user": user.model_dump(), "rows": contributions_response.data}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_contribution(
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
        contributions_response = (
            supabase.schema("finance")
            .table("saving_contributions")
            .delete()
            .eq("id", id)
            .execute()
        )
        return {"user": user.model_dump(), "rows": contributions_response.data}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
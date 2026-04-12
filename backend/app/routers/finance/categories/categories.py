from fastapi import APIRouter, Depends, HTTPException
from app.dependencies import get_supabase, get_user_token
from starlette import status

router = APIRouter(prefix="/categories", tags=["finance-categories"])


@router.get("/", status_code=status.HTTP_200_OK)
async def get_categories(
    supabase=Depends(get_supabase),
    tokens=Depends(get_user_token),
):
    try:
        access = tokens.get("access_token")
        refresh = tokens.get("refresh_token")
        supabase.auth.set_session(access, refresh)

        user_resp = supabase.auth.get_user()
        if not user_resp.user:
            raise HTTPException(status_code=401, detail="Unauthorized: No valid session")

        response = (
            supabase.schema("finance")
            .table("categories")
            .select("id, name, parent_id, icon, is_income")
            .order("name")
            .execute()
        )

        return {"rows": response.data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Get categories failed: {e}")

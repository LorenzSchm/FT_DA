from fastapi import APIRouter, Depends, HTTPException
from app.dependencies import get_supabase, get_user_token
from fastapi.security import HTTPBearer
from starlette import status

router = APIRouter(prefix="/finance", tags=["finance"])
auth_scheme = HTTPBearer(auto_error=True)

@router.get("/", status_code=status.HTTP_200_OK)
async def get_finance(supabase=Depends(get_supabase), credentials=Depends(get_user_token)):
    try:
        supabase.auth.set_session(credentials)
        resp = supabase.auth.get_user_by_id(credentials)


        if not resp or not resp.user:
            raise HTTPException(status_code=401, detail="Unauthorized: No valid session")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Get finance failed: {e}")




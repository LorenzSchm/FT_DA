from fastapi import APIRouter

router = APIRouter(prefix="/brandfetch", tags=["brandfetch"])
@router.get("/{url}")
async def get_brandfetch_logo(url: str):
    return url
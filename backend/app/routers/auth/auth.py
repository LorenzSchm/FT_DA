import supabase
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Dict, Any, Optional

from app.dependencies import get_supabase
from starlette.responses import JSONResponse

router = APIRouter(prefix="/auth", tags=["auth"])
auth_scheme = HTTPBearer(auto_error=True)


class SignOutRequest(BaseModel):
    access_token: str
    refresh_token: str

class SignUpRequest(BaseModel):
    email: EmailStr
    password: str
    display_name: Optional[str] = None

class SignUpResponse(BaseModel):
    user: Dict[str, Any]
    session: Dict[str, Any] | None
    message: str

class SignInRequest(BaseModel):
    email: EmailStr
    password: str

class SignInResponse(BaseModel):
    user: Dict[str, Any]
    session: Dict[str, Any] | None
    message: str

class RefreshAccessTokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    expires_at: int | str



@router.post("/sign-in", response_model=SignInResponse, status_code=status.HTTP_200_OK)
async def sign_in(request: SignInRequest, supabase=Depends(get_supabase)):
    try:
        response = supabase.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password
        })

        if not response or not response.user:
            raise HTTPException(status_code=400, detail="Sign-in failed")

        return SignInResponse(
            user=response.user.__dict__,
            session={
                "access_token": response.session.access_token,
                "refresh_token": response.session.refresh_token,
                "expires_at": response.session.expires_at
            } if response.session else None,
            message="User signed in successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Sign-in failed: {e}")

@router.post("/sign-up", response_model=SignUpResponse, status_code=status.HTTP_201_CREATED)
async def sign_up(request: SignUpRequest, supabase=Depends(get_supabase)):
    try:
        response = supabase.auth.sign_up({
            "email": request.email,
            "password": request.password,
            "options": {
                    "data": {
                        "display_name": request.display_name
                    }
            }
        })

        if not response or not response.user:
            raise HTTPException(status_code=400, detail="Sign-up failed")
        return SignUpResponse(
            user=response.user.__dict__,
            session={
                "access_token": response.session.access_token,
                "refresh_token": response.session.refresh_token,
                "expires_at": response.session.expires_at
            } if response.session else None,
            message="User signed up successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Sign-up failed: {e}")

@router.post("/sign-out", status_code=status.HTTP_200_OK)
async def sign_out(
        request: SignOutRequest,
        supabase=Depends(get_supabase),
):
    try:
        supabase.auth.set_session(request.access_token, request.refresh_token)
        supabase.auth.sign_out()
        return {"message": "User signed out successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Sign-out failed: {e}")

@router.get("/refresh-token", response_model=RefreshAccessTokenResponse, status_code=status.HTTP_200_OK)
async def refresh_access_token(
        supabase=Depends(get_supabase),
        credentials: HTTPAuthorizationCredentials = Depends(auth_scheme),):
    try:
        response = supabase.auth.refresh_session(credentials.credentials)
        if not response or not response.user:
            raise HTTPException(status_code=400, detail="Refresh failed")

        expires_at_val = None
        try:
            expires_at_val = int(response.session.expires_at) if response.session and response.session.expires_at is not None else None
        except Exception:
            expires_at_val = response.session.expires_at if response.session else None

        return RefreshAccessTokenResponse(
            access_token=response.session.access_token,
            refresh_token=response.session.refresh_token,
            expires_at=expires_at_val
        )

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Refresh failed: {e}")

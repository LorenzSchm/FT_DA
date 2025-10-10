import supabase
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from typing import Dict, Any, Optional

from app.dependencies import get_supabase

router = APIRouter(prefix="/auth", tags=["auth"])


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

class VerifyTokenRequest(BaseModel):
    email: EmailStr
    otp: str


class ResendOTPRequest(BaseModel):
    email: EmailStr

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





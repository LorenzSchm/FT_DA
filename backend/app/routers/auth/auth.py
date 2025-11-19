from http.client import HTTPResponse

import supabase
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from numpy.f2py.rules import options
from pydantic import BaseModel, EmailStr
from typing import Dict, Any, Optional

from app.dependencies import get_supabase, get_user_token
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

class VerifyRequest(BaseModel):
    otp: str
    email: str

class ResetPasswordRequest(BaseModel):
    password: str

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
            if response.session and response.session.expires_at is not None:
                expires_at_val = int(response.session.expires_at)
            else:
                expires_at_val = None
        except Exception:
            expires_at_val = response.session.expires_at if response.session else None

        return RefreshAccessTokenResponse(
            access_token=response.session.access_token,
            refresh_token=response.session.refresh_token,
            expires_at=expires_at_val
        )

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Refresh failed: {e}")

@router.get("/otp/{email}")
async def get_otp(
        email: str,
        supabase=Depends(get_supabase),
):
    try:
        response = supabase.auth.sign_in_with_otp({
            "email": email,
        })

        return JSONResponse(
            status_code=200,
            content={
                "response": "OTP sent successfully"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Get OTP failed: {e}")

@router.post("/verify-otp")
async def verify_otp(
    request: VerifyRequest,
    supabase = Depends(get_supabase),
):
    try:
        response = supabase.auth.verify_otp({
            "email": request.email,
            "token": request.otp,
            "type": "email"
        })

        if not response.session:
            raise HTTPException(status_code=400, detail="Invalid or expired OTP")

        return {
            "user": response.user.dict(),
            "session": {
                "access_token": response.session.access_token,
                "refresh_token": response.session.refresh_token,
                "expires_at": response.session.expires_at,
                "expires_in": response.session.expires_in,
            },
            "message": "OTP verified successfully"
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Verify OTP failed: {str(e)}")

@router.post("/reset-password")
async def reset_password(
        request: ResetPasswordRequest,
        supabase=Depends(get_supabase),
        tokens=Depends(get_user_token),
):
    try:
        access = tokens.get("access_token")
        refresh = tokens.get("refresh_token")
        supabase.auth.set_session(access, refresh)
        response = supabase.auth.update_user({
            "password": request.password,
        })
        if not response or not response.user:
            raise HTTPException(status_code=400, detail="Reset password failed")
        return {"message": "Password reset successfully"}

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Reset password failed: {e}")
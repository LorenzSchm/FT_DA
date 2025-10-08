from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import Dict, Any

from app.dependencies import SupabaseClient

router = APIRouter(prefix="/auth", tags=["auth"])


class SignUpRequest(BaseModel):
    email: EmailStr
    password: str

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

@router.post("/sign-up", response_model=SignUpResponse, status_code=status.HTTP_201_CREATED)
async def sign_up(request: SignUpRequest, supabase: SupabaseClient):
    try:
        response = supabase.auth.sign_up({
            "email": request.email,
            "password": request.password
        })

        if not response or not response.user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Sign-up failed: Invalid response from authentication service"
            )

        return SignUpResponse(
            user=response.user.__dict__ if hasattr(response.user, '__dict__') else {},
            session=response.session.__dict__ if response.session and hasattr(response.session, '__dict__') else None,
            message="User created successfully"
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Sign-up failed: {str(e)}"
        )


@router.post("/sign-in", response_model=SignInResponse, status_code=status.HTTP_200_OK)
async def sign_in(request: SignInRequest, supabase: SupabaseClient):
    try:
        response = supabase.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password
        })

        if not response or not response.user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Sign-in failed: Invalid response from authentication service"
            )

        return SignInResponse(
            user=response.user.__dict__ if hasattr(response.user, '__dict__') else {},
            session=response.session.__dict__ if response.session and hasattr(response.session, '__dict__') else None,
            message="User signed in successfully"
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Sign-in failed: {str(e)}"
        )
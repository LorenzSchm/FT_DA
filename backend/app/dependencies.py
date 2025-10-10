from fastapi import Request, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer(auto_error=True)

def get_supabase(request: Request):
    return request.app.state.supabase

def get_user_token(
        credentials: HTTPAuthorizationCredentials  = Depends(security)
) -> str:
    return credentials.credentials

def get_supabase_for_user(
        request: Request,
        token: str = Depends(get_user_token)
):
    base_supabase = request.app.state.supabase
    user_supabase = base_supabase.postgrest.auth(token)
    return user_supabase

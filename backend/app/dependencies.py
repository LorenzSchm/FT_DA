from fastapi import Request, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import time
import logging

security = HTTPBearer(auto_error=True)
logger = logging.getLogger("app.dependencies")


def get_supabase(request: Request):
    return request.app.state.supabase


def get_user_token(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> str:
    access_token = credentials.credentials if credentials else None
    refresh_token = request.headers.get("x-refresh-token") or request.cookies.get("refresh_token")

    if not access_token:
        raise HTTPException(status_code=401, detail="Missing access token")

    return {"access_token": access_token, "refresh_token": refresh_token}


def get_supabase_for_user(request: Request, token: str = Depends(get_user_token)):
    """Return a postgrest client bound to the provided token (useful for postgrest calls).

    Falls back to returning the base client if binding fails.
    """
    base_supabase = request.app.state.supabase
    if not base_supabase:
        raise HTTPException(status_code=500, detail="Supabase client not configured")

    try:
        return base_supabase.postgrest.auth(token)
    except Exception:
        logger.debug("get_supabase_for_user: falling back to base client")
        return base_supabase


def get_supabase_for_user_session(
    request: Request,
    token: str = Depends(get_user_token),
):
    """Ensure the Supabase client has a usable session for the provided token.

    Strategy:
    1. Try `set_session(access_token=token, refresh_token="")`.
    2. If that doesn't yield a usable session, call `get_user(token)` to validate
       the token and synthesize a Session object, then save it in-memory.

    Raises HTTP 401 for invalid tokens and HTTP 500 for server-side issues.
    """
    base_supabase = request.app.state.supabase
    if not base_supabase:
        raise HTTPException(status_code=500, detail="Supabase client not configured")

    # 1) Try to set session directly
    try:
        base_supabase.auth.set_session(access_token=token, refresh_token="")
        if base_supabase.auth.get_session() is not None:
            return base_supabase
        logger.debug("set_session did not create a usable session; falling back")
    except Exception as exc:
        logger.debug("set_session raised: %s", exc)

    # 2) Validate token and synthesize a session
    try:
        resp = base_supabase.auth.get_user(token)
        if not resp or not getattr(resp, "user", None):
            raise HTTPException(status_code=401, detail="Unauthorized: invalid token")

        # Lazy import Session model
        try:
            from supabase_auth.types import Session as SupabaseSession
        except Exception as exc:
            logger.exception("Failed to import Supabase Session type: %s", exc)
            raise HTTPException(status_code=500, detail="Server configuration error")

        # Determine expires_in; prefer session value if present
        expires_in = 3600
        if getattr(resp, "session", None) and getattr(resp.session, "expires_in", None):
            try:
                expires_in = int(resp.session.expires_in)
            except Exception:
                pass

        now = round(time.time())
        expires_at = now + int(expires_in)

        session_obj = SupabaseSession(
            access_token=token,
            refresh_token="",
            expires_in=int(expires_in),
            expires_at=expires_at,
            token_type="bearer",
            user=resp.user,
        )

        # Try to save session via internal API, else set in-memory session directly
        try:
            base_supabase.auth._save_session(session_obj)
        except Exception as exc:
            logger.debug("_save_session failed: %s", exc)
            logger.error("No public API available to set session in-memory; cannot proceed without manipulating private attributes.")
            raise HTTPException(status_code=500, detail="Unable to set Supabase session using public APIs")
        # Final verification
        try:
            if base_supabase.auth.get_session() is None:
                debug = {
                    "has_in_memory": hasattr(base_supabase.auth, "_in_memory_session"),
                    "in_memory_is_set": bool(getattr(base_supabase.auth, "_in_memory_session", None)),
                    "persist_session": bool(getattr(base_supabase.auth, "_persist_session", False)),
                    "storage_present": hasattr(base_supabase.auth, "_storage"),
                }
                logger.debug("session still not set after synthesize: %s", debug)
                raise HTTPException(status_code=401, detail=f"Unauthorized: unable to set session ({debug})")
        except AttributeError:
            logger.debug("auth client missing get_session method")
            raise HTTPException(status_code=500, detail="Supabase client missing required methods")

        return base_supabase

    except HTTPException:
        raise
import os
from dotenv import load_dotenv
from supabase import create_client, Client
from typing import Annotated
from fastapi import Depends

load_dotenv()

def get_supabase_client() -> Client:
    url: str = os.getenv("SUPABASE_URL")
    key: str = os.getenv("SUPABASE_KEY")

    if not url or not key:
        raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environment variables")

    supabase: Client = create_client(url, key)
    return supabase

SupabaseClient = Annotated[Client, Depends(get_supabase_client)]

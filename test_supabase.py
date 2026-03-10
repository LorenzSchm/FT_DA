import os
from supabase import create_client

url = "https://jibgxgjntrahtvtynqes.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppYmd4Z2pudHJhaHR2dHlucWVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMTI2MjcsImV4cCI6MjA2Nzg4ODYyN30.o8pK5YWihl8IET-P51hjNYKal7NeTVjy6baHBdhQp1M"
supabase = create_client(url, key)

try:
    # Fetch a single row to inspect columns. RLS might block this.
    res = supabase.schema("finance").table("saving_contributions").select("*").limit(1).execute()
    print("Columns:", list(res.data[0].keys()) if res.data else "No data but success")
except Exception as e:
    print("Error:", e)

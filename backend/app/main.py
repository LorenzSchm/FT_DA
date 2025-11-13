from contextlib import asynccontextmanager

from fastapi import FastAPI

from .routers.account.account import router as account_router
from .routers.auth.auth import router as auth_router
from .routers.savings.savings import router as savings_router
from .routers.bank_connection.bank_connection import router as bank_connection_router
from .routers.bot.bot import router as bot_router
from .routers.investments.investments import router as investments_router
from .utils.external.yfinance.yfinance_api import router as yfinance_router
from .routers.finance.finance import router as finance_router
from supabase import create_client, Client

import os
from dotenv import load_dotenv
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_KEY")

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    yield
    app.state.supabase = None

app = FastAPI(lifespan=lifespan)
app.include_router(account_router)
app.include_router(auth_router)
app.include_router(savings_router)
app.include_router(bank_connection_router)
app.include_router(bot_router)
app.include_router(investments_router)

app.include_router(yfinance_router)

app.include_router(finance_router)
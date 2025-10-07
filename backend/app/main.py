from fastapi import FastAPI

from .routers.account.account import router as account_router
from .routers.auth.auth import router as auth_router
from .routers.savings.savings import router as savings_router
from .routers.bank_connection.bank_connection import router as bank_connection_router
from .routers.bot.bot import router as bot_router
from .routers.invetsments.investments import router as investments_router
from .routers.transactions.transactions import router as transactions_router

app = FastAPI()
app.include_router(account_router)
app.include_router(auth_router)
app.include_router(savings_router)
app.include_router(bank_connection_router)
app.include_router(bot_router)
app.include_router(investments_router)
app.include_router(transactions_router)

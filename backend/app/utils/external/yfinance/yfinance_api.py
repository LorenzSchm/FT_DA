import yfinance as yf
from fastapi import APIRouter
#https://ranaroussi.github.io/yfinance
router = APIRouter(prefix="/stock", tags=["stock"])
@router.get("/{ticker_symbol}/price")
def get_stock_price(ticker_symbol: str):
    ticker = yf.Ticker(ticker_symbol)
    price = ticker.info.get("regularMarketPrice")
    data = ticker.history(period="1mo")
    last_week = data.tail(5)
    first = last_week["Close"].iloc[0]
    last = last_week["Close"].iloc[-1]
    percent_change = ((last - first) / first) * 100
    rounded = round(percent_change, 2)
    return {"price": price, "weekly_change": rounded}
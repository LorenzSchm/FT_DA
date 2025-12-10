import yfinance as yf
from fastapi import APIRouter
import math
from urllib.parse import urlparse
from datetime import datetime
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
    domain = urlparse(ticker.info.get("website")).netloc
    domain = domain.removeprefix("www.")  # Removes 'www.' if it exists
    return {"price": price, "weekly_change": rounded, "longname": ticker.info.get("longName"), "domain": domain}

@router.get("/{ticker_symbol}/history")
def get_chart_history(ticker_symbol: str):
    ticker = yf.Ticker(ticker_symbol)

    periods = {
        "1D": ("1d", "5m"),      # 1-day, 5-minute resolution
        "1W": ("5d", "1h"),      # 5-day, 1-hour resolution
        "1M": ("1mo", "1d"),     # 1-month, 1-day resolution
        "1Y": ("1y", "1wk"),     # 1-year, 1-week resolution
        "ALL": ("max", "1mo")    # all history, monthly resolution
    }

    result = {}

    # First, get 1D data to have the most recent price
    df_1d = ticker.history(period="1d", interval="5m")
    latest_entry = None

    if not df_1d.empty:
        last_ts = df_1d.index[-1]
        last_price = df_1d["Close"].iloc[-1]
        if last_price is not None and not (isinstance(last_price, float) and math.isnan(last_price)):
            latest_entry = {
                "timestamp": int(last_ts.timestamp() * 1000),
                "value": float(last_price)
            }

    for label, (period, interval) in periods.items():
        df = ticker.history(period=period, interval=interval)

        if df.empty:
            result[label] = []
            continue

        entries = []
        for ts, row in df.iterrows():
            price = row["Close"]

            # Sometimes Close is NaN → skip it
            if price is None or (isinstance(price, float) and math.isnan(price)):
                continue

            entries.append({
                "timestamp": int(ts.timestamp() * 1000),
                "value": float(price)
            })

        # For non-1D timeframes, append the latest 1D entry if it's newer
        if label != "1D" and latest_entry and entries:
            last_entry_ts = entries[-1]["timestamp"]
            if latest_entry["timestamp"] > last_entry_ts:
                entries.append(latest_entry)

        result[label] = entries

    return result
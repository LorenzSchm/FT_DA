import yfinance as yf
from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
import math
from urllib.parse import urlparse
from datetime import datetime, timedelta
#https://ranaroussi.github.io/yfinance
router = APIRouter(prefix="/stock", tags=["stock"])

@router.get("/{ticker_symbol}/price")
def get_stock_price(ticker_symbol: str):
    try:
        ticker = yf.Ticker(ticker_symbol)

        info = ticker.info or {}
        price = info.get("regularMarketPrice")

        # Weekly change (fallback-safe)
        rounded = 0.0
        data = ticker.history(period="1mo")
        if data is not None and not data.empty:
            last_week = data.tail(5)
            if len(last_week) >= 2:
                first = last_week["Close"].iloc[0]
                last = last_week["Close"].iloc[-1]
                if first not in (0, None) and not (isinstance(first, float) and math.isnan(first)):
                    percent_change = ((last - first) / first) * 100
                    if percent_change is not None and not (isinstance(percent_change, float) and math.isnan(percent_change)):
                        rounded = round(float(percent_change), 2)

        # Domain (website can be missing or not a string)
        website = info.get("website")
        domain = ""
        if isinstance(website, str) and website:
            try:
                domain = urlparse(website).netloc or ""
                domain = domain.removeprefix("www.")
            except Exception:
                domain = ""

        return {
            "price": price,
            "weekly_change": rounded,
            "longname": info.get("longName"),
            "domain": domain,
        }
    except Exception as e:
        return JSONResponse(
            status_code=502,
            content={"detail": f"Failed to fetch data for {ticker_symbol}: {type(e).__name__}"},
        )

@router.get("/{ticker_symbol}/price-at-date")
def get_price_at_date(ticker_symbol: str, date: str = Query(..., pattern=r"^\d{4}-\d{2}-\d{2}$")):
    try:
        target = datetime.strptime(date, "%Y-%m-%d").date()
        start = target - timedelta(days=6)
        end = target + timedelta(days=1)

        ticker = yf.Ticker(ticker_symbol)
        df = ticker.history(start=str(start), end=str(end))

        if df.empty:
            return {"price": None, "date": None}

        # Find the closest trading day on or before the target date
        valid = df[df.index.date <= target]
        if valid.empty:
            # All available dates are after target; take the earliest
            row = df.iloc[0]
            return {
                "price": round(float(row["Close"]), 4),
                "date": str(df.index[0].date()),
            }

        row = valid.iloc[-1]
        return {
            "price": round(float(row["Close"]), 4),
            "date": str(valid.index[-1].date()),
        }
    except Exception as e:
        return JSONResponse(
            status_code=502,
            content={"detail": f"Failed to fetch historical price for {ticker_symbol}: {type(e).__name__}"},
        )


@router.get("/{ticker_symbol}/history")
def get_chart_history(ticker_symbol: str):
    try:
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

            # For non-1D timeframes, ensure the last price matches the latest known price
            if label != "1D" and latest_entry and entries:
                last_entry_ts = entries[-1]["timestamp"]
                if latest_entry["timestamp"] > last_entry_ts:
                    # Latest price is newer than the last entry → append it
                    entries.append(latest_entry)
                else:
                    # The last candle (e.g. incomplete week/month) already covers this time,
                    # but its close price may differ from the current price → update it
                    entries[-1]["value"] = latest_entry["value"]

            result[label] = entries

        return result
    except Exception as e:
        return JSONResponse(
            status_code=502,
            content={"detail": f"Failed to fetch history for {ticker_symbol}: {type(e).__name__}"},
        )
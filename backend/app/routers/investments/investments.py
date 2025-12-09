from fastapi import APIRouter, HTTPException, Depends, Body
from app.dependencies import get_supabase, get_user_token
from collections import defaultdict
import yfinance as yf
from datetime import date
from typing import Any

router = APIRouter(prefix="/investments", tags=["investments"])

DIVISOR = 10000.0
BASE_CURRENCY = "EUR"


@router.get("/")
async def get_investments(
    supabase=Depends(get_supabase),
    tokens=Depends(get_user_token),
):
    try:
        access = tokens.get("access_token")
        refresh = tokens.get("refresh_token")
        supabase.auth.set_session(access, refresh)
        user_resp = supabase.auth.get_user()
        user = user_resp.user
        if not user:
            raise HTTPException(status_code=401, detail="Unauthorized: No valid session")

        response = (
            supabase.schema("invest")
            .table("trades")
            .select("*")
            .eq("user_id", user.id)
            .order("trade_date", desc=False)
            .order("created_at", desc=False)
            .execute()
        )
        trades = response.data

        if not trades:
            return {
                "positions": [],
                "summary": {
                    "cash": {},
                    "total_market_value": 0.0,
                    "total_cost_basis": 0.0,
                    "total_unrealized_pl": 0.0,
                    "total_portfolio_value": 0.0,
                    "base_currency": BASE_CURRENCY,
                    "as_of_date": date.today().isoformat(),
                }
            }


        unique_tickers = list({trade["ticker"].upper() for trade in trades if trade.get("ticker")})


        info_map: dict[str, dict] = {}
        current_prices: dict[str, float] = {}
        ticker_currency_map: dict[str, str] = {}

        if unique_tickers:
            tickers_obj = yf.Tickers(" ".join(unique_tickers))
            for ticker in unique_tickers:
                t_obj = tickers_obj.tickers.get(ticker)
                if not t_obj:
                    current_prices[ticker] = 0.0
                    info_map[ticker] = {}
                    ticker_currency_map[ticker] = "USD"
                    continue

                price = t_obj.fast_info.get("lastPrice") or t_obj.fast_info.get("previousClose") or 0.0
                current_prices[ticker] = float(price)
                info_map[ticker] = t_obj.info
                currency = t_obj.info.get("currency") or t_obj.info.get("financialCurrency") or "USD"
                ticker_currency_map[ticker] = currency


        holdings = defaultdict(lambda: {"quantity": 0.0, "cost_minor": 0.0, "currency": "USD"})
        cash_minor_per_cur = defaultdict(int)
        # per-ticker per-trade records in chronological order
        dates_by_ticker: dict[str, list[dict]] = defaultdict(list)

        for trade in trades:
            ticker = trade["ticker"].upper()
            currency = ticker_currency_map.get(ticker, "USD")

            gross_minor = int(trade["gross_minor"])
            fee_minor = int(trade.get("fee_minor") or 0)
            qty = float(trade["quantity"])
            ttype = trade["type"].lower()

            # compute per-trade price, fee, gross
            tdate = trade.get("trade_date")
            trade_date_str = str(tdate) if tdate is not None else None
            trade_gross = (gross_minor / DIVISOR)
            trade_fee = (fee_minor / DIVISOR)
            entry_price = (trade_gross / qty) if qty not in (0.0, 0) else 0.0

            # Cash impact
            if ttype == "buy":
                cash_minor_per_cur[currency] -= (gross_minor + fee_minor)
            elif ttype == "sell":
                cash_minor_per_cur[currency] += (gross_minor - fee_minor)


            h = holdings[ticker]
            h["currency"] = currency

            # apply trade to running position
            if ttype == "buy":
                h["cost_minor"] += gross_minor + fee_minor
                h["quantity"] += qty
            elif ttype == "sell":
                if h["quantity"] > 1e-9:
                    avg_cost = h["cost_minor"] / h["quantity"]
                    cost_to_remove = avg_cost * qty
                    h["cost_minor"] = max(0.0, h["cost_minor"] - cost_to_remove)
                h["quantity"] -= qty
                if h["quantity"] < 0:
                    h["quantity"] = 0.0

            # snapshot after trade
            pos_qty = h["quantity"]
            cost_basis_after = h["cost_minor"] / DIVISOR
            avg_entry_after = (cost_basis_after / pos_qty) if pos_qty > 0 else 0.0
            cur_price = current_prices.get(ticker, 0.0)
            market_value_after = pos_qty * cur_price
            unrealized_pl_after = market_value_after - cost_basis_after
            unrealized_pl_pct_after = (unrealized_pl_after / cost_basis_after * 100) if cost_basis_after > 0 else 0.0

            dates_by_ticker[ticker].append({
                "date": trade_date_str,
                "type": ttype,
                "quantity": round(qty, 8),
                "entry_price": round(entry_price, 4),
                "gross": round(trade_gross, 2),
                "fee": round(trade_fee, 2),
                "position_quantity": round(pos_qty, 8),
                "avg_entry_price": round(avg_entry_after, 4),
                "cost_basis": round(cost_basis_after, 2),
                "current_price": round(cur_price, 4),
                "market_value": round(market_value_after, 2),
                "unrealized_pl": round(unrealized_pl_after, 2),
                "unrealized_pl_pct": round(unrealized_pl_pct_after, 2),
            })

        open_holdings = {t: h for t, h in holdings.items() if h["quantity"] > 0.001}


        used_currencies = (
            {h["currency"] for h in holdings.values()}
            | set(cash_minor_per_cur.keys())
            | {BASE_CURRENCY}
        )

        fx_tickers = []
        for cur in used_currencies:
            if cur != BASE_CURRENCY:
                fx_tickers.append(f"{cur}{BASE_CURRENCY}=X")
                fx_tickers.append(f"{BASE_CURRENCY}{cur}=X")

        fx_tickers = list(set(fx_tickers))
        if fx_tickers:
            fx_obj = yf.Tickers(" ".join(fx_tickers))
            for ft in fx_tickers:
                ft_upper = ft.upper()
                f_obj = fx_obj.tickers.get(ft_upper)
                if f_obj:
                    rate = f_obj.fast_info.get("lastPrice") or f_obj.fast_info.get("previousClose") or 0.0
                    current_prices[ft_upper] = float(rate)

        def get_conversion_rate(from_cur: str) -> float:
            if from_cur == BASE_CURRENCY:
                return 1.0
            direct = f"{from_cur}{BASE_CURRENCY}=X".upper()
            rate = current_prices.get(direct)
            if rate and rate > 0:
                return rate
            inverse = f"{BASE_CURRENCY}{from_cur}=X".upper()
            inv_rate = current_prices.get(inverse)
            if inv_rate and inv_rate > 0:
                return 1 / inv_rate
            return 1.0  # fallback


        positions = []
        total_market_base = 0.0
        total_cost_base = 0.0
        total_cash_base = 0.0

        for ticker, h in open_holdings.items():
            info = info_map.get(ticker, {})
            price = current_prices.get(ticker, 0.0)
            currency = h["currency"]
            quantity = h["quantity"]
            cost_basis = h["cost_minor"] / DIVISOR
            market_value = quantity * price

            positions.append({
                "ticker": ticker,
                "name": info.get("longName") or info.get("shortName") or ticker.split("-")[0],
                "asset_type": (
                    "cryptocurrency" if info.get("quoteType") == "CRYPTOCURRENCY" else
                    "etf" if info.get("quoteType") == "ETF" else
                    "stock"
                ),
                "currency": currency,
                "current_price": round(price, 4),
                "dates": dates_by_ticker.get(ticker, []),
            })

            rate = get_conversion_rate(currency)
            total_market_base += market_value * rate
            total_cost_base += cost_basis * rate

        cash_converted: dict[str, float] = {}
        for cur, minor in cash_minor_per_cur.items():
            amount = minor / DIVISOR
            if abs(amount) >= 0.01:
                cash_converted[cur] = round(amount, 2)
            rate = get_conversion_rate(cur)
            total_cash_base += amount * rate

        summary = {
            "cash": cash_converted,
            "total_market_value": round(total_market_base, 2),
            "total_cost_basis": round(total_cost_base, 2),
            "total_unrealized_pl": round(total_market_base - total_cost_base, 2),
            "total_portfolio_value": round(total_market_base + total_cash_base, 2),
            "base_currency": BASE_CURRENCY,
            "as_of_date": date.today().isoformat(),
        }

        # sort by total market value per ticker (derived from last date snapshot)
        def ticker_market_value(item: dict) -> float:
            ds = item.get("dates") or []
            return float(ds[-1].get("market_value", 0.0)) if ds else 0.0

        positions.sort(key=ticker_market_value, reverse=True)

        return {
            "positions": positions,
            "summary": summary,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Portfolio calculation failed: {str(e)}")


@router.post("/")
async def create_trade(
    request: Any = Body(...),
    supabase=Depends(get_supabase),
    tokens=Depends(get_user_token),
):
    try:
        access = tokens.get("access_token")
        refresh = tokens.get("refresh_token")
        supabase.auth.set_session(access, refresh)
        user_resp = supabase.auth.get_user()
        user = user_resp.user
        if not user:
            raise HTTPException(status_code=401, detail="Unauthorized")

        payload = request.model_dump(exclude_none=True) if hasattr(request, "model_dump") else request

        ticker = payload["ticker"].strip().upper()
        if not ticker:
            raise HTTPException(400, "ticker is required")

        type_ = payload["type"].lower()
        if type_ not in ["buy", "sell"]:
            raise HTTPException(400, "type must be 'buy' or 'sell'")

        quantity = float(payload["quantity"])
        if quantity <= 0:
            raise HTTPException(400, "quantity must be > 0")

        price = float(payload["price"])
        fee = float(payload.get("fee", 0.0))
        trade_date = payload.get("trade_date") or date.today().isoformat()


        test_ticker = ticker
        t = yf.Ticker(test_ticker)
        if not (t.fast_info.get("lastPrice") or t.fast_info.get("previousClose")):
            crypto_ticker = f"{ticker}-USD"
            t2 = yf.Ticker(crypto_ticker)
            if t2.fast_info.get("lastPrice") or t2.fast_info.get("previousClose"):
                ticker = crypto_ticker
            else:
                raise HTTPException(400, "Invalid or unsupported ticker")

        gross = quantity * price
        gross_minor = int(round(gross * DIVISOR))
        fee_minor = int(round(fee * DIVISOR))

        trade_data = {
            "user_id": user.id,
            "ticker": ticker,
            "type": type_,
            "quantity": quantity,
            "gross_minor": gross_minor,
            "fee_minor": fee_minor,
            "trade_date": trade_date,
        }

        supabase.schema("invest").table("trades").insert(trade_data).execute()

        return {"status": "success", "ticker": ticker}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Trade creation failed: {str(e)}")

@router.delete("/{id}")
async def delete_trade(
    id: str,
    supabase=Depends(get_supabase),
    tokens=Depends(get_user_token),
):
    try:
        access = tokens.get("access_token")
        refresh = tokens.get("refresh_token")
        supabase.auth.set_session(access, refresh)
        user_resp = supabase.auth.get_user()
        user = user_resp.user
        if not user:
            raise HTTPException(status_code=401, detail="Unauthorized")

        delete_response = (
            supabase.schema("invest")
            .table("trades")
            .delete()
            .eq("id", id)
            .execute()
        )
        return {"user": user.model_dump(), "rows": delete_response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Trade deletion failed: {str(e)}")


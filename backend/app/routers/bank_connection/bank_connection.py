from decimal import Decimal, InvalidOperation

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from app.dependencies import get_supabase, get_user_token
import os
from dotenv import load_dotenv
from starlette.responses import JSONResponse
import requests
from requests.exceptions import JSONDecodeError

load_dotenv()

router = APIRouter(prefix="/bank", tags=["bank"])


class TransactionRequest(BaseModel):
    type: str
    amount_minor: float | str
    currency: str
    description: Optional[str] = None
    merchant: Optional[str] = None


def restructure_tx(tx: dict):
    tx_type_raw = tx.get("transaction_type")
    if tx_type_raw == "CREDIT":
        tx_type = "INCOME"
    elif tx_type_raw == "DEBIT":
        tx_type = "EXPENSE"
    else:
        tx_type = "UNKNOWN"

    raw_amount = abs(tx.get("amount", 0))

    try:
        amount_dec = Decimal(str(raw_amount))
    except (InvalidOperation, TypeError):
        amount_dec = Decimal("0.00")

    amount_minor = int((amount_dec.copy_abs() * 100).quantize(Decimal("1")))

    return TransactionRequest(
        type=tx_type,
        amount_minor=amount_minor,
        currency=tx.get("currency") or "GBP",
        description=tx.get("description"),
        merchant=None,
    )


def truelayer_txs_to_transaction_requests(
        txs: list[dict],
) -> list[TransactionRequest]:
    return [restructure_tx(tx) for tx in txs]


async def exchange_auth_code_for_tokens(code):
    print(f"Exchanging auth code: {code[:10]}...")  # Debug: partial code for security
    response = requests.post("https://auth.truelayer-sandbox.com/connect/token", data={
        'grant_type': 'authorization_code',
        'redirect_uri': 'exp://--',
        'client_id': os.environ.get("TRUELAYER_CLIENT_ID"),
        'client_secret': os.environ.get("TRUELAYER_CLIENT_SECRET"),
        "code": code
    })
    print(f"Token response status: {response.status_code}")

    if response.status_code != 200:
        print(f"Token error response: {response.text}")
        raise HTTPException(status_code=502, detail=f"Token endpoint error: {response.status_code} {response.text}")

    try:
        token_data = response.json()
        print(f"Token data keys: {list(token_data.keys())}")
    except (ValueError, JSONDecodeError) as e:
        print(f"JSON decode error: {e}")
        raise HTTPException(status_code=502, detail="Token endpoint returned non-JSON response")

    if not token_data.get('access_token'):
        print("No access_token in response")
        raise HTTPException(status_code=502, detail="No access_token in token response")

    return token_data


async def fetch_accounts(access_token):
    print("Fetching accounts")
    response_account = requests.get(
        "https://api.truelayer-sandbox.com/data/v1/accounts",
        headers={
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/json"
        },
    )
    print(f"Accounts response status: {response_account.status_code}")

    if response_account.status_code != 200:
        print(f"Accounts error response: {response_account.text}")
        raise HTTPException(status_code=502,
                            detail=f"Failed to fetch accounts: {response_account.status_code} {response_account.text}")

    try:
        accounts_json = response_account.json()
        print(f"Accounts results length: {len(accounts_json.get('results', []))}")
    except (ValueError, JSONDecodeError) as e:
        print(f"Accounts JSON decode error: {e}")
        raise HTTPException(status_code=502, detail="Accounts endpoint returned non-JSON response")

    return accounts_json.get("results", [])


def select_first_account(accounts):
    print(f"Selecting first account from {len(accounts)} accounts")
    if accounts and len(accounts) > 0:
        return accounts[0]
    raise HTTPException(status_code=404, detail="No accounts found")


async def insert_bank_connection(supabase, user_id, account, access_token, refresh_token, created_at, currency, name):
    print(f"Inserting bank connection for user_id: {user_id}")
    print(account)
    provider = account.get("provider", {})
    try:
        res = supabase.schema("ext").table("bank_connections").insert({
            "user_id": user_id,
            "provider": provider.get("display_name"),
            "provider_acc_id": account.get("account_id"),
            "access_token_enc": access_token,
            "refresh_token_enc": refresh_token,
            "status": "ACTIVE",
            "created_at": created_at,
            "provider_logo": provider.get("logo_uri"),
            "currency": currency,
            "name": name
        }).execute()

        if res.data:
            res_account = supabase.schema("finance").table("accounts").insert({
                "user_id": user_id,
                "name": name,
                "institution": provider.get("display_name"),
                "currency": currency,
                "kind": "connect",
                "ext_conn_id": res.data[0].get("id"),
                "created_at": created_at,
            }).execute()

            if res_account.data:
                return res.data
            else:
                raise HTTPException(status_code=502, detail="Failed to persist bank connection")
        else:
            raise HTTPException(status_code=502, detail="Failed to persist bank connection")

    except Exception as e:
        print(f"Insert error: {e}")
        raise HTTPException(status_code=502, detail=f"Failed to persist bank connection: {str(e)}")


async def get_transactions(access_token, acct_id):
    print(f"Fetching transactions for account: {acct_id}")
    tx_url = f"https://api.truelayer-sandbox.com/data/v1/accounts/{acct_id}/transactions"
    transaction_response = requests.get(
        tx_url,
        headers={
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/json"
        },
    )
    print(f"Transactions response status: {transaction_response.status_code}")

    if transaction_response.status_code != 200:
        print(f"Transactions error: {transaction_response.text}")
        raise HTTPException(status_code=502,
                            detail=f"Failed to fetch transactions: {transaction_response.status_code} {transaction_response.text}")

    try:
        tx_json = transaction_response.json()
        print(f"Transactions results length: {len(tx_json.get('results', []))}")
    except (ValueError, JSONDecodeError) as e:
        print(f"Transactions JSON error: {e}")
        raise HTTPException(status_code=502, detail="Transactions endpoint returned non-JSON response")
    return tx_json.get("results", [])


async def get_balance(access_token, acct_id):
    print(f"Fetching balance for account: {acct_id}")
    balance_url = f"https://api.truelayer-sandbox.com/data/v1/accounts/{acct_id}/balance"
    balance_response = requests.get(
        balance_url,
        headers={
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/json"
        },
    )
    print(f"Balance response status: {balance_response.status_code}")
    if balance_response.status_code != 200:
        print(f"Balance error: {balance_response.text}")
        raise HTTPException(status_code=502,
                            detail=f"Failed to fetch balance: {balance_response.status_code} {balance_response.text}")
    try:
        balance_json = balance_response.json()
        print(f"Balance results: {balance_json.get('results')}")
    except (ValueError, JSONDecodeError) as e:
        print(f"Balance JSON error: {e}")
        raise HTTPException(status_code=502, detail="Balance endpoint returned non-JSON response")
    return balance_json.get("results", [])


async def refresh_token(refresh_token):
    print("Refreshing token")
    print(f"Refresh token: {refresh_token}")
    response = requests.post("https://auth.truelayer-sandbox.com/connect/token", data={
        'grant_type': 'refresh_token',
        'client_id': os.environ.get("TRUELAYER_CLIENT_ID"),
        'client_secret': os.environ.get("TRUELAYER_CLIENT_SECRET"),
        "refresh_token": refresh_token
    })
    print(f"Refresh response status: {response.status_code}")

    if response.status_code == 200:
        try:
            token_data = response.json()
            print(f"Refreshed token keys: {list(token_data.keys())}")
        except (ValueError, JSONDecodeError) as e:
            print(f"Refresh JSON error: {e}")
            raise HTTPException(status_code=502, detail="Invalid JSON from token endpoint")
        return {
            'access_token': token_data['access_token'],
            'refresh_token': token_data.get('refresh_token')
        }
    else:
        print(f"Refresh error: {response.text}")
        raise HTTPException(status_code=502,
                            detail=f"Failed to fetch access token: {response.status_code} {response.text}")


async def connect_bank(code, supabase, name):
    print("Starting connect_bank")
    try:
        token_data = await exchange_auth_code_for_tokens(code)
        access_token = token_data['access_token']
        refresh_token = token_data.get('refresh_token')
        print("Tokens exchanged")
        accounts = await fetch_accounts(access_token)
        print("Accounts fetched")
        account = select_first_account(accounts)
        acct_id = account['account_id']
        print(f"Selected account: {acct_id}")
        transactions = await get_transactions(access_token, acct_id)
        print("Transactions fetched")
        tx_reqs = truelayer_txs_to_transaction_requests(transactions)
        balance = await get_balance(access_token, acct_id)
        print("Balance fetched")
        user_resp = supabase.auth.get_user()
        print(f"User response: {user_resp}")
        user = user_resp.user
        user_id = user.id
        print(f"User ID: {user_id}")
        created_at = str(transactions[0].get("timestamp")) if transactions else None
        currency = account.get("currency")
        await insert_bank_connection(supabase, user_id, account, access_token, refresh_token, created_at, currency, name)
        print("Bank connection inserted")
        return {
            "access_token": access_token,
            "transactions": tx_reqs,
            "balance": balance
        }
    except Exception as e:
        print(f"Error in connect_bank: {e}")
        raise


@router.post("/generate-token")
async def generate_token(
        request: dict,
        supabase=Depends(get_supabase),
        tokens=Depends(get_user_token),
):
    print("Entering generate_token")
    print(f"Request body: {request}")
    try:
        access = tokens.get("access_token")
        refresh = tokens.get("refresh_token")
        print(f"Tokens: access={access[:10]}..., refresh={refresh[:10]}...")
        supabase.auth.set_session(access, refresh)
        print("Session set")

        user_resp = supabase.auth.get_user()
        print(f"User response: {user_resp}")
        user = getattr(user_resp, "user", None)
        print(f"User: {user}")

        if not user and not request.get("code"):
            print("Not authenticated and no code")
            raise HTTPException(status_code=401, detail="Not authenticated")

        code = request.get("code")
        if code:
            print(f"Code provided: {code[:10]}...")
            return await connect_bank(code, supabase, request.get("name") or "Bank Account")

        print("No code provided")
        raise HTTPException(status_code=400, detail="No code provided")

    except HTTPException as e:
        print(f"HTTPException: {e}")
        raise e
    except Exception as e:
        print(f"Unexpected error in generate_token: {e}")
        raise HTTPException(status_code=400, detail=f"Post finance failed: {e}")


@router.get("/data")
async def get_transactions_and_balance(
        supabase=Depends(get_supabase),
        tokens=Depends(get_user_token),
):
    print("Entering get_transactions_and_balance")
    try:
        access = tokens.get("access_token")
        refresh = tokens.get("refresh_token")
        print(f"Tokens: access={access[:10]}..., refresh={refresh[:10]}...")
        supabase.auth.set_session(access, refresh)
        print("Session set")

        user_resp = supabase.auth.get_user()
        print(f"User response: {user_resp}")
        user = user_resp.user
        print(f"User: {user}")

        if not user:
            print("Not authenticated")
            raise HTTPException(status_code=401, detail="Not authenticated")


        user_id = user.id
        print(f"User ID from metadata: {user_id}")

        print("Fetching bank connection")
        conn_res = supabase.schema("ext").table("bank_connections").select("*").eq("user_id", user_id).execute()
        print(f"Connection fetch data: {conn_res.data}")

        connections = conn_res.data
        print(f"Connections found: {len(connections)}")

        if not connections:
            raise HTTPException(status_code=404, detail="No bank connection found")

        connection = connections[0]
        acct_id = connection["provider_acc_id"]
        current_refresh_token = connection["refresh_token_enc"]
        current_access_token = connection["access_token_enc"]
        print(f"Account ID: {acct_id}")

        print("Refreshing token")
        refreshed = await refresh_token(current_refresh_token)
        access_token = refreshed['access_token']
        new_refresh_token = refreshed.get('refresh_token', current_refresh_token)
        print("Token refreshed")

        print("Updating bank connection")
        update_res = supabase.schema("ext").table("bank_connections").update({
            "access_token_enc": access_token,
            "refresh_token_enc": new_refresh_token
        }).eq("user_id", user_id).execute()
        print(f"Update data: {update_res.data}")

        transactions = await get_transactions(access_token, acct_id)
        tx_reqs = truelayer_txs_to_transaction_requests(transactions)
        balance = await get_balance(access_token, acct_id)

        return {
            "transactions": tx_reqs,
            "balance": balance,
            "name": connection["name"]
        }

    except HTTPException as e:
        print(f"HTTPException in get_data: {e}")
        raise e
    except Exception as e:
        print(f"Unexpected error in get_data: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get transactions and balance: {e}")
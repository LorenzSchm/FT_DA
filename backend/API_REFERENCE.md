# FastAPI Endpoint Catalog

This document lists every route that `app.main` registers so you can rapidly build a chart or other visual reference. All paths are relative to the FastAPI root (e.g., `https://<host>/account`). JSON bodies/outputs omit Supabase-internal metadata for brevity.

## Conventions
- **Auth headers** – Every endpoint that depends on `get_user_token` requires:
  - `Authorization: Bearer <Supabase access token>`
  - `X-Refresh-Token: <Supabase refresh token>` (or a `refresh_token` cookie)
- **Error shape** – On failure FastAPI returns `{ "detail": "<message>" }` with the HTTP status set via `HTTPException`.
- **Time values** – Unless specified, timestamps follow ISO 8601 strings supplied by Supabase or upstream providers.

## Endpoint Index
| Domain | Method | Path | Auth? | Summary |
| --- | --- | --- | --- | --- |
| Account | GET | `/account/` | Bearer + refresh | Return the authenticated Supabase user profile. |
| Account | PATCH | `/account/` | Bearer + refresh | Update email and/or display name for the logged-in user. |
| Auth | POST | `/auth/sign-in` | No | Authenticate with email/password and receive tokens. |
| Auth | POST | `/auth/sign-up` | No | Create a Supabase user with optional display name metadata. |
| Auth | POST | `/auth/sign-out` | Access+refresh in body | Revoke the provided session inside Supabase. |
| Auth | GET | `/auth/refresh-token` | Bearer (refresh token) | Exchange a refresh token for a new access token pair. |
| Auth | GET | `/auth/otp/{email}` | No | Send a Supabase OTP email for passwordless login. |
| Auth | POST | `/auth/verify-otp` | No | Verify an emailed OTP; returns user + session. |
| Auth | POST | `/auth/reset-password` | Bearer + refresh | Update the password for the current session. |
| Bank | POST | `/bank/generate-token` | Bearer + refresh | Exchange a TrueLayer auth code, persist the bank connection, and return initial data. |
| Bank | GET | `/bank/data` | Bearer + refresh | Refresh stored bank tokens and return latest transactions + balance. |
| Finance Accounts | GET | `/finance/` | Bearer + refresh | List finance accounts owned by the user. |
| Finance Accounts | POST | `/finance/` | Bearer + refresh | Create a finance account record. |
| Finance Accounts | DELETE | `/finance/{id}` | Bearer + refresh | Delete a finance account by UUID. |
| Finance Accounts | PATCH | `/finance/{id}` | Bearer + refresh | Update selected fields on a finance account. |
| Finance Transactions | POST | `/finance/transactions/{account_id}` | Bearer + refresh | Append a manual transaction to an account. |
| Finance Transactions | GET | `/finance/transactions/{account_id}` | Bearer + refresh | Fetch all transactions for an account. |
| Finance Transactions | DELETE | `/finance/transactions/{account_id}/{id}` | Bearer + refresh | Delete a transaction by id. |
| Finance Subscriptions | GET | `/finance/subscriptions/{account_id}` | Bearer + refresh | List recurring subscriptions for an account. |
| Finance Subscriptions | POST | `/finance/subscriptions/{account_id}` | Bearer + refresh | Create a subscription tied to an account. |
| Finance Subscriptions | DELETE | `/finance/subscriptions/{id}` | Bearer + refresh | Delete a subscription by id. |
| Finance Subscriptions | PATCH | `/finance/subscriptions/{id}` | Bearer + refresh | Update a subscription. |
| Saving Goals | GET | `/finance/saving-goals/` | Bearer + refresh | List saving goals plus aggregated contributions. |
| Saving Goals | POST | `/finance/saving-goals/` | Bearer + refresh | Create a saving goal. |
| Saving Goals | DELETE | `/finance/saving-goals/{id}` | Bearer + refresh | Delete a saving goal. |
| Saving Goals | PATCH | `/finance/saving-goals/{id}` | Bearer + refresh | Update goal name/target/currency. |
| Saving Contributions | POST | `/finance/saving-goals/contributions/` | Bearer + refresh | Record a contribution toward a goal. |
| Saving Contributions | DELETE | `/finance/saving-goals/contributions/{id}` | Bearer + refresh | Remove a contribution. |
| Investments | GET | `/investments/` | Bearer + refresh | Compute current portfolio positions and cash summary. |
| Investments | POST | `/investments/` | Bearer + refresh | Insert a trade (buy/sell) in the ledger. |
| Investments | DELETE | `/investments/{id}` | Bearer + refresh | Delete a trade by id. |
| Stock Data | GET | `/stock/{ticker_symbol}/price` | No | Snapshot price, weekly change, and metadata for a ticker. |
| Stock Data | GET | `/stock/{ticker_symbol}/history` | No | Multi-range historical close prices for charting. |
| Bot (placeholder) | – | `/bot` | – | Router is registered but currently exposes no paths. |
| Savings (placeholder) | – | `/savings` | – | Router is registered but currently exposes no paths. |

---

## Detailed Endpoint Notes

### Account (`/account`)

#### `GET /account/`
- **Purpose**: returns the active Supabase user record.
- **Auth**: requires `Authorization` and `X-Refresh-Token` headers.
- **Response 200** (`UserResponse`):
  ```json
  {
    "id": "<uuid>",
    "display_name": "Alice",
    "email": "alice@example.com",
    "email_confirmed_at": "2024-01-01T12:00:00Z",
    "created_at": "2023-12-01T09:15:00Z",
    "updated_at": "2024-02-10T08:30:00Z"
  }
  ```

#### `PATCH /account/`
- **Body** (`UpdateUserRequest`):
  - `email` *(optional EmailStr)* – change login email.
  - `display_name` *(optional str)* – stored in Supabase `user_metadata`.
  - `refresh_token` *(str)* – needed to call Supabase `set_session`.
- **Response 200**: same shape as `GET /account/`.
- **Errors**: `400` when neither `email` nor `display_name` is provided.

### Authentication (`/auth`)

#### `POST /auth/sign-in`
- **Body** (`SignInRequest`): `email`, `password`.
- **Response 200** (`SignInResponse`): `{ "user": <Supabase user dict>, "session": {"access_token", "refresh_token", "expires_at"}, "message": "User signed in successfully" }`.

#### `POST /auth/sign-up`
- **Body** (`SignUpRequest`): `email`, `password`, optional `display_name` (persisted as Supabase metadata).
- **Response 201**: same structure as sign-in with `message: "User signed up successfully"`.

#### `POST /auth/sign-out`
- **Body** (`SignOutRequest`): `access_token`, `refresh_token` of the session to revoke.
- **Response 200**: `{ "message": "User signed out successfully" }`.

#### `GET /auth/refresh-token`
- **Auth**: `Authorization: Bearer <refresh_token>` (note the refresh token goes in the header).
- **Response 200** (`RefreshAccessTokenResponse`): `{ "access_token", "refresh_token", "expires_at" }`.

#### `GET /auth/otp/{email}`
- **Path parameter**: `email` – Supabase login to send OTP to.
- **Response 200**: `{ "response": "OTP sent successfully" }`.

#### `POST /auth/verify-otp`
- **Body** (`VerifyRequest`): `otp`, `email`.
- **Response 200**: `{ "user": <dict>, "session": {"access_token", "refresh_token", "expires_at", "expires_in"}, "message": "OTP verified successfully" }`.

#### `POST /auth/reset-password`
- **Auth**: `Authorization` + `X-Refresh-Token` for the user who is resetting.
- **Body** (`ResetPasswordRequest`): `password` (new value).
- **Response 200**: `{ "message": "Password reset successfully" }`.

### Bank Connections (`/bank`)

#### `POST /bank/generate-token`
- **Auth**: Bearer access token + refresh header.
- **Body**: arbitrary dict, but the implementation expects:
  - `code` *(str)* – TrueLayer authorization code.
  - `name` *(optional str)* – friendly name for the linked account (defaults to "Bank Account").
- **What it does**: exchanges the auth code for TrueLayer tokens, fetches the first account’s transactions/balance, stores the connection in Supabase (`ext.bank_connections` + `finance.accounts`), and returns normalized data.
- **Response 200**:
  ```json
  {
    "access_token": "<truelayer access token>",
    "transactions": [ {"type": "INCOME", "amount_minor": 12345, "currency": "GBP", "description": "Salary", "merchant": null }, ... ],
    "balance": [ { "currency": "GBP", "current" : 1200.34, ... } ]
  }
  ```

#### `GET /bank/data`
- **Auth**: Bearer access token + refresh header.
- **Behavior**: loads the user’s stored bank connection, refreshes the TrueLayer token, updates Supabase with the new tokens, pulls latest transactions and balance, and returns them.
- **Response 200**:
  ```json
  {
    "transactions": [ {"type": "EXPENSE", "amount_minor": 3299, "currency": "GBP", "description": "Groceries"}, ... ],
    "balance": [ {"available": 850.12, "currency": "GBP", ... } ],
    "name": "<connection nickname>"
  }
  ```

### Finance Accounts (`/finance`)

All endpoints require auth headers.

- **`GET /finance/`** – returns `{ "user": <supabase user>, "rows": [<account row>...] }` where each row is read from `finance.accounts`.
- **`POST /finance/`** – body (`CreateFinanceAccountRequest`):
  - `user_id` *(optional str)* – overrides the inferred Supabase user id (normally omitted).
  - `name` *(str)*, `institution` *(optional str)*, `currency` *(str)*, `kind` *(str, e.g., "connect" or "manual"), `ext_conn_id` *(optional str)*, `archived_at` *(optional ISO datetime)*.
  - Response: inserted rows from Supabase.
- **`DELETE /finance/{id}`** – removes the account row whose `id` matches the UUID supplied in the path.
- **`PATCH /finance/{id}`** – identical body schema as POST; only supplied fields are updated.

### Finance Transactions (`/finance/transactions`)

- **`POST /finance/transactions/{account_id}`**
  - Body (`TransactionRequest`): `type` (e.g., `INCOME`/`EXPENSE`), `amount_minor` (int or str storing cents), `currency`, optional `description`, `merchant`.
  - Server adds `txn_date` = current date, `source` = `manual`, and `created_at` timestamp before inserting into `finance.transactions`.
  - Response: `{ "user": <user>, "rows": [<inserted transaction>] }`.
- **`GET /finance/transactions/{account_id}`** – returns `{ "user": <user>, "rows": [ ... ] }` filtered by `account_id`.
- **`DELETE /finance/transactions/{account_id}/{id}`** – deletes the transaction whose primary key equals `id`. (The `account_id` path segment is present for routing consistency but is not used in the query.)

### Finance Subscriptions (`/finance/subscriptions`)

- **`GET /finance/subscriptions/{account_id}`** – returns subscriptions from `finance.subscriptions` filtered by account.
- **`POST /finance/subscriptions/{account_id}`**
  - Body (`AddSubscriptionRequest`):
    - `merchant`, `amount_minor`, `currency`, `every_n` *(default 1)*, `unit` *(default `"month"`)*, `start_date`, `auto_detected` *(bool)*, `active` *(bool)*, optional `category_id`, optional `next_due_date`.
  - Response: inserted row(s) with a server-populated `created_at`.
- **`DELETE /finance/subscriptions/{id}`** – remove subscription by id.
- **`PATCH /finance/subscriptions/{id}`** – same body schema as POST; updates existing row.

### Saving Goals (`/finance/saving-goals`)

- **`GET /finance/saving-goals/`** – returns each goal plus:
  - `contributed_minor`: sum of related `saving_contributions`.
  - `contributions`: the raw contribution rows.
- **`POST /finance/saving-goals/`** – body (`SavingGoalRequest`): `name`, `target_minor` (int), `currency`. Response echoes inserted rows.
- **`DELETE /finance/saving-goals/{id}`** – delete by id.
- **`PATCH /finance/saving-goals/{id}`** – body matches POST and only supplied fields change.

### Saving Contributions (`/finance/saving-goals/contributions`)

- **`POST /finance/saving-goals/contributions/`** – body (`ContributionRequest`): `goal_id`, `contributed_minor`. Server stamps `contributed_at` with the current timestamp.
- **`DELETE /finance/saving-goals/contributions/{id}`** – remove a contribution row.

### Investments (`/investments`)

All routes require auth headers. Monetary values are stored as integer minor units using `DIVISOR = 10000`.

- **`GET /investments/`**
  - Pulls every trade in `invest.trades` for the user, enriches with live data from Yahoo Finance, and aggregates:
    - `positions`: list containing `ticker`, `name`, `asset_type`, `currency`, `quantity`, `avg_entry_price`, `current_price`, `cost_basis`, `market_value`, `unrealized_pl`, `unrealized_pl_pct`, and per-trade `dates` snapshots.
    - `summary`: `{ "cash": {"USD": -1200.0, ...}, "total_market_value", "total_cost_basis", "total_unrealized_pl", "total_portfolio_value", "base_currency": "EUR", "as_of_date": "YYYY-MM-DD" }`.
- **`POST /investments/`**
  - Body fields (typical): `ticker`, `type` (`buy` or `sell`), `quantity` (float > 0), `price` (float), optional `fee` (float), optional `trade_date` (ISO date).
  - The service validates tickers (supports crypto ticker fallback), converts price/fee to minor units, and inserts a trade row.
  - Response: `{ "status": "success", "ticker": "<final ticker>" }`.
- **`DELETE /investments/{id}`** – deletes the trade whose `id` matches the path parameter; response mirrors other finance endpoints (`{"user": ..., "rows": [...]}`).

### Stock Data (`/stock`)

No authentication required. These routes proxy Yahoo Finance via `yfinance` and are useful for lightweight UI cards.

- **`GET /stock/{ticker_symbol}/price`** – returns `{ "price": <float>, "weekly_change": <percent float>, "longname": "...", "domain": "example.com" }`. The weekly change compares the oldest and newest close values in the most recent five trading days.
- **`GET /stock/{ticker_symbol}/history`** – response is an object with keys `1D`, `1W`, `1M`, `1Y`, `ALL`; each value is a list like `[ { "timestamp": 1706908800000, "value": 185.32 }, ... ]`. The latest 1-day point is appended to longer ranges if it is newer than the last available candle.

### Placeholder Routers
- **`/bot`** – router registered with prefix `/bot` but no endpoints exist yet.
- **`/savings`** – router registered with prefix `/savings` but no endpoints exist yet.

> **Note**: `app/utils/external/brandFetch/brandfetchAPI.py` defines a `/brandfetch/{url}` route, but it is *not* included in `app.main` and therefore is not exposed by the FastAPI application.

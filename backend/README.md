# FT_DA Backend

FastAPI service that will power the FT_DA personal finance assistant. The
repository currently provides a modular foundation with routers for core
domains (accounts, authentication, savings, investments, transactions,
banking connections, and the conversational bot) plus scaffolding for OCR and
external data integrations. Endpoint logic is intentionally left blank, so the
next development tasks can focus on wiring real business rules into the
pre-defined shells.

## Getting Started

Prerequisites:

- Python 3.13 (matches the Docker image and `pyproject.toml` requirement)
- [`uv`](https://docs.astral.sh/uv/) for dependency management (installed with
  `pip install uv`)

Local setup:

```bash
# install dependencies into a local .venv
uv sync

# run the API with auto-reload for development
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Docker workflow:

```bash
# build the image
docker build -t ft-da-backend .

# run the container
docker run --rm -p 8000:8000 ft-da-backend
```

## Project Layout

```
app/
├── main.py                     # FastAPI app that registers all routers
├── routers/
│   ├── account/                # Placeholder endpoints for account data
│   ├── auth/                   # Authentication logic to be implemented
│   ├── bank_connection/        # Banking aggregation / Truelayer-style hooks
│   ├── bot/                    # AI assistant conversation endpoints
│   ├── invetsments/            # Investment endpoints (typo retained from source)
│   ├── savings/                # Savings goal tracking endpoints
│   └── transactions/           # Transaction ingestion and queries
└── utils/
    ├── analysis/               # OCR scaffolding for bills and brokerage docs
    └── external/               # API client stubs (OpenAI, BrandFetch, FX, etc.)
```

## Development Tasks

1. Flesh out each router with concrete request/response models, validation,
   and business logic.
2. Implement authentication/authorization flows (e.g., JWT issuance,
   session checks) inside `app/routers/auth`.
3. Connect banking and investment routers to real data sources and move
   shared dependencies into `app/dependencies.py`.
4. Complete the OCR pipeline in `app/utils/analysis/` so files uploaded by the
   bot or transactions routers can be parsed reliably.
5. Implement external service clients (OpenAI, BrandFetch, ExchangeRate,
   yfinance) and centralize API configuration/secrets management.
6. Add automated tests (ideally with `pytest`) and wire CI to run them.

## Notes for Contributors

- Keep routers focused on HTTP orchestration; push heavy lifting into
  dedicated service modules so the code stays testable.
- The repository currently has no linting or formatting tooling. Consider
  adding `ruff`/`black`/`mypy` once the codebase grows.
- When renaming `app/routers/invetsments`, remember to update imports in
  `app/main.py` and anywhere else the module is referenced.
- Update this README as new endpoints and workflows are implemented so the
  backend remains easy to onboard onto.

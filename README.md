# CardWise

CardWise is a full-stack credit-card discovery and recommendation application.
The React/Vite client is in `frontend/`; the FastAPI/SQLAlchemy API and Alembic
migrations are in `backend/`.

For a complete introduction to the user interface, public and admin pages,
frontend architecture, data flow, and contributor guidance, read the
[Frontend application overview](frontend/docs/APP_OVERVIEW.md).

## Run the full application locally

Use two terminals. Start the backend first, and then start the frontend.

### 1. Start the backend

For a native Python setup, follow
[`backend/docs/LOCAL_DEVELOPMENT.md`](backend/docs/LOCAL_DEVELOPMENT.md). The short version
for Windows PowerShell is:

```powershell
cd backend
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements-dev.txt
Copy-Item .env.example .env -ErrorAction SilentlyContinue
python -m alembic upgrade head
python -m app.database.seed
python -m uvicorn app.main:app --reload
```

Docker is also supported:

```powershell
cd backend
docker compose up --build
```

Verify the API at <http://localhost:8000/health> and open its Swagger UI at
<http://localhost:8000/docs>.

### 2. Start the frontend

Follow [`frontend/docs/LOCAL_DEVELOPMENT.md`](frontend/docs/LOCAL_DEVELOPMENT.md). The short
version is:

```powershell
cd frontend
Copy-Item .env.example .env -ErrorAction SilentlyContinue
npm install
npm run dev
```

Open <http://localhost:5173>. During development, Vite proxies `/api` and
`/uploads` requests to the backend at <http://localhost:8000>.

## Detailed documentation

- [Frontend application overview](frontend/docs/APP_OVERVIEW.md) — introduction,
  pages, capabilities, architecture, data flow, and contributor direction.
- [Backend local setup](backend/docs/LOCAL_DEVELOPMENT.md) — Python and Docker setup,
  database initialization, tests, configuration, and troubleshooting.
- [Frontend local setup](frontend/docs/LOCAL_DEVELOPMENT.md) — Node setup, environment
  variables, development/build commands, and troubleshooting.
- [Backend folder structure](backend/docs/FOLDER_STRUCTURE.md) — backend
  directories and layer ownership.
- [Frontend folder structure](frontend/docs/FOLDER_STRUCTURE.md) — frontend
  directories and organization rules.
- [Backend reference](backend/README.md) — API, architecture, database, admin,
  and recommendation-engine documentation.
- [Frontend reference](frontend/README.md) — UI architecture and expected API
  contract.

## Quality checks

```powershell
# From backend/ with its virtual environment active
python -m pytest
python -m ruff check app alembic

# From frontend/
npm run typecheck
npm run lint
npm run build
```

## Production notes

- Replace the development admin password and set strong `ADMIN_API_KEY` and
  `CARDWISE_JWT_SECRET` values.
- Restrict `CORS_ORIGINS` to deployed frontend origins.
- Apply Alembic migrations before serving traffic and disable automatic schema
  creation.
- SQLite is suitable for this local/single-instance setup. Use PostgreSQL and a
  shared rate-limit store when horizontally scaling the application.

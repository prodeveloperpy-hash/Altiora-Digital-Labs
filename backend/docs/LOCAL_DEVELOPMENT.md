# Backend local development

This guide runs the FastAPI backend locally with SQLite. Choose either native
Python for the quickest edit/test loop or Docker Compose for an isolated setup.

## Prerequisites

For the native setup:

- Python 3.12 or newer
- `pip` and Python's built-in `venv` module

For the container setup:

- Docker Desktop with Docker Compose

Check the native tools in Windows PowerShell:

```powershell
py -3.12 --version
```

## Option A: Native Python (recommended for development)

### 1. Create and activate a virtual environment

From the repository root in Windows PowerShell:

```powershell
cd backend
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
```

On macOS or Linux:

```bash
cd backend
python3.12 -m venv .venv
source .venv/bin/activate
```

If PowerShell blocks activation, either allow locally created scripts for your
user or invoke the environment's Python directly:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements-dev.txt
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

### 2. Install dependencies

```powershell
python -m pip install --upgrade pip
python -m pip install -r requirements-dev.txt
```

`requirements-dev.txt` includes the application dependencies plus pytest,
HTTPX, and Ruff.

### 3. Create local configuration

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

macOS or Linux:

```bash
cp .env.example .env
```

The provided development values use `sqlite:///./cardwise.db`, allow the Vite
development origins, create missing tables, and seed an empty database. If
`.env` already exists, do not overwrite it without reviewing your local values.

For local admin testing, the seeded login is `admin` / `ChangeMe!2024`. This is
development-only. Set `CARDWISE_DEFAULT_ADMIN_PASSWORD` and a strong
`CARDWISE_JWT_SECRET` before using the service outside your machine.

### 4. Initialize the database

```powershell
python -m alembic upgrade head
python -m app.database.seed
```

Seeding is idempotent, so this command is safe to run again. Startup also
creates/seeds the database when `AUTO_CREATE_TABLES=true` and `AUTO_SEED=true`,
but running these commands explicitly makes setup failures easier to diagnose.

### 5. Start the API

```powershell
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Keep the terminal running and verify:

- Liveness: <http://localhost:8000/health>
- API health/readiness: <http://localhost:8000/api/health>
- Swagger UI: <http://localhost:8000/docs>
- ReDoc: <http://localhost:8000/redoc>

Press `Ctrl+C` to stop the server. Run `deactivate` to leave the virtual
environment.

## Option B: Docker Compose

From the repository root:

```powershell
cd backend
docker compose up --build
```

The container applies migrations, starts the API on port 8000, and stores its
SQLite database in the named `cardwise-data` volume. Useful commands:

```powershell
# Start in the background
docker compose up --build -d

# Follow API logs
docker compose logs -f api

# Stop containers while keeping database data
docker compose down
```

`docker compose down -v` also deletes the database volume and all local data;
only use it when you intentionally want a clean database.

## Tests and code quality

With the virtual environment active, run from `backend/`:

```powershell
python -m pytest
python -m ruff check app alembic
```

Ruff can format-check imports and lint rules. Apply safe automatic lint fixes
with:

```powershell
python -m ruff check app alembic --fix
```

## Database commands

```powershell
python -m alembic upgrade head
python -m alembic current
python -m alembic revision -m "describe_change"
python -m app.database.seed
```

Migration generation may need manual review before it is committed. The local
SQLite database file is `backend/cardwise.db`.

## Important environment variables

| Variable | Local default | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | `sqlite:///./cardwise.db` | Database connection URL. |
| `API_PREFIX` | `/api` | Prefix for application API routes. |
| `CORS_ORIGINS` | localhost Vite origins | JSON array of allowed browser origins. |
| `AUTO_CREATE_TABLES` | `true` | Create missing tables at startup. |
| `AUTO_SEED` | `true` | Seed an empty database at startup. |
| `RATE_LIMIT_ENABLED` | `true` | Enable the per-client request limit. |
| `ADMIN_API_KEY` | empty | Optional local protection for mutation endpoints. |
| `CARDWISE_JWT_SECRET` | development default | Secret used to sign admin JWTs; replace outside local development. |

See [`../.env.example`](../.env.example) and [`../README.md`](../README.md) for the complete
configuration and API reference.

## Common problems

### Port 8000 is already in use

Stop the existing process or start on another port:

```powershell
python -m uvicorn app.main:app --reload --port 8001
```

Then set `VITE_DEV_API_PROXY=http://localhost:8001` in `frontend/.env` and
restart the frontend.

### `ModuleNotFoundError` or an unknown `uvicorn` command

Confirm the virtual environment is active and use module commands:

```powershell
python -m pip install -r requirements-dev.txt
python -m uvicorn app.main:app --reload
```

### Database schema errors

Apply migrations and seed again:

```powershell
python -m alembic upgrade head
python -m app.database.seed
```

### Browser CORS errors

The normal Vite setup uses a proxy and should not require CORS changes. For a
direct browser-to-API connection, add the exact frontend origin to the JSON
array in `CORS_ORIGINS`, then restart the backend.

Do not commit `.env`, `cardwise.db`, credentials, or generated upload files.

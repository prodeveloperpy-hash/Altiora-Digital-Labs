# CardWise

CardWise is a full-stack credit-card discovery and recommendation application.
The React/Vite client lives in `frontend/`; the FastAPI/SQLAlchemy service and
its Alembic migrations live in `backend/`.

## Local development

1. Follow `backend/README.md` to create a Python 3.12 environment and start the API.
2. Copy `frontend/.env.example` to `frontend/.env`.
3. In `frontend/`, run `npm install` and `npm run dev`.

The frontend runs at http://localhost:5173 and proxies `/api` to the backend at
http://localhost:8000. API documentation is available at http://localhost:8000/docs.

## Quality checks

- Backend: `python -m pytest` and `python -m ruff check app alembic`
- Frontend: `npm run typecheck`, `npm run lint`, and `npm run build`

## Production notes

- Set a strong `ADMIN_API_KEY`; all API mutations must send it as `X-API-Key`.
- Restrict `CORS_ORIGINS` to the deployed frontend origin.
- Apply Alembic migrations before serving traffic and disable automatic schema creation.
- SQLite is suitable for the included single-instance deployment. Use PostgreSQL
  plus a shared rate-limit store for horizontally scaled production deployments.

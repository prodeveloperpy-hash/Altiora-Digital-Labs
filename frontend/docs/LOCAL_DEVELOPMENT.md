# Frontend local development

This guide runs the React 19 + TypeScript + Vite frontend on your machine. The
frontend expects the CardWise backend to be available at
`http://localhost:8000`.

## Prerequisites

- Node.js 20 LTS or newer
- npm (included with Node.js)
- A running CardWise backend; see
  [`../../backend/docs/LOCAL_DEVELOPMENT.md`](../../backend/docs/LOCAL_DEVELOPMENT.md)

Check the installed tools:

```powershell
node --version
npm --version
```

## First-time setup

From the repository root in Windows PowerShell:

```powershell
cd frontend
Copy-Item .env.example .env
npm install
```

On macOS or Linux:

```bash
cd frontend
cp .env.example .env
npm install
```

If `.env` already exists, compare it with `.env.example` instead of overwriting
your local values.

## Start the development server

```powershell
npm run dev
```

Open <http://localhost:5173>. Keep this terminal running. Vite reloads the page
when source files change.

The default `.env` configuration is:

```dotenv
VITE_API_BASE_URL=/api
VITE_DEV_API_PROXY=http://localhost:8000
VITE_API_TIMEOUT=15000
VITE_APP_NAME=Altiora Digital Labs
```

With these values, browser requests to `/api/*` and `/uploads/*` are proxied by
Vite to the backend. Restart `npm run dev` after changing `.env`.

## Verify the integration

1. Confirm the backend health endpoint returns a successful response at
   <http://localhost:8000/health>.
2. Open <http://localhost:5173>.
3. Browse the cards page and confirm data loads without a network error.
4. If needed, open the browser developer tools and inspect the Network tab;
   API requests should use `http://localhost:5173/api/...` and be proxied to the
   backend.

## Available commands

Run these from `frontend/`:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server on port 5173. |
| `npm run typecheck` | Check TypeScript without producing build files. |
| `npm run lint` | Run ESLint with zero warnings allowed. |
| `npm run build` | Type-check and create a production bundle in `dist/`. |
| `npm run preview` | Serve the production bundle locally for inspection. |

To preview a production build:

```powershell
npm run build
npm run preview
```

Vite prints the preview URL in the terminal (normally
`http://localhost:4173`).

## Common problems

### The page loads but API requests fail

- Start the backend and verify <http://localhost:8000/health>.
- Confirm `VITE_API_BASE_URL=/api` and
  `VITE_DEV_API_PROXY=http://localhost:8000` in `frontend/.env`.
- Restart the Vite process after editing `.env`.

### Port 5173 is already in use

Stop the process using the port, or choose another port:

```powershell
npm run dev -- --port 5174
```

If using another origin without the Vite proxy, add that origin to the
backend's `CORS_ORIGINS` setting.

### Dependencies behave unexpectedly

Use the lockfile for a clean, reproducible install:

```powershell
npm ci
```

Do not commit `.env`; commit new safe defaults to `.env.example` instead.

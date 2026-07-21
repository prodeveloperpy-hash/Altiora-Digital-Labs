# Altiora Digital Labs — Frontend

A modern, banking-quality UI for a database-driven credit card recommendation
platform. Built with **React 19, TypeScript, Vite, TailwindCSS, React Router,
TanStack Query, Axios, React Hook Form, and Zod**.

This app is **frontend only**. It integrates with a backend over HTTP and
contains **no mock data** — every list, card, recommendation, and FAQ is fetched
from the API. The backend is assumed to expose the endpoints documented below.

## Getting started

```bash
npm install
npm run dev        # start the dev server on http://localhost:5173
npm run build      # type-check and produce a production build in dist/
npm run preview    # preview the production build
npm run lint       # lint the codebase
npm run typecheck  # type-check without emitting
```

### Environment

Copy `.env.example` to `.env` and adjust as needed:

| Variable             | Default                 | Purpose                                        |
| -------------------- | ----------------------- | ---------------------------------------------- |
| `VITE_API_BASE_URL`  | `/api`                  | Base URL prefixed to every request.            |
| `VITE_DEV_API_PROXY` | `http://localhost:8000` | Dev-only target the `/api` proxy forwards to.  |
| `VITE_API_TIMEOUT`   | `15000`                 | Axios request timeout (ms).                    |
| `VITE_APP_NAME`      | `Altiora Digital Labs`  | App display name.                              |

During development, requests to `/api/*` are proxied to `VITE_DEV_API_PROXY`, so
no CORS configuration is required.

## Expected backend API contract

All paths are relative to `VITE_API_BASE_URL`.

| Method | Path                        | Description                                              |
| ------ | --------------------------- | ------------------------------------------------------- |
| `GET`  | `/cards`                    | Paginated, filterable card list & search.               |
| `GET`  | `/cards/featured`           | Curated featured cards (home page).                     |
| `GET`  | `/cards/:id`                | A single card by id or slug.                            |
| `GET`  | `/cards/compare?ids=a,b,c`  | Full details for a set of cards.                        |
| `GET`  | `/categories`               | Card categories with counts.                            |
| `POST` | `/recommendations`          | Ranked, scored matches for questionnaire answers.       |
| `GET`  | `/faqs`                     | Frequently asked questions.                             |

### `GET /cards` query parameters

`search`, `category`, `network`, `creditScore`, `maxAnnualFee`, `noAnnualFee`,
`sort` (`recommended | rating | annualFee | apr | name`), `direction`
(`asc | desc`), `page`, `pageSize`.

Response shape (`PaginatedResponse<CreditCard>`):

```jsonc
{
  "items": [ /* CreditCard[] */ ],
  "page": 1,
  "pageSize": 12,
  "total": 128,
  "totalPages": 11
}
```

The exact `CreditCard`, `Category`, `Recommendation`, and `FaqItem` shapes are
defined in `src/features/*/types.ts` and are the single source of truth for the
integration.

### `POST /recommendations`

Body: the `QuestionnaireAnswers` object (see
`src/features/questionnaire/types.ts`). Response: `RecommendationResult` with a
ranked `recommendations[]`, each carrying a `matchScore` (0–100) and
human-readable `reasons[]` produced by the backend's rules engine.

### Error responses

Any non-2xx response is normalized into an `ApiError` (see `src/lib/apiError.ts`).
For validation errors, the backend may return:

```jsonc
{ "message": "…", "code": "…", "errors": { "field": "message" } }
```

## Architecture

Clean, feature-based architecture with a strict separation of concerns:

```
src/
  app/         Router, providers, query client
  components/
    ui/        Presentational primitives (Button, Card, Modal, …)
    layout/    App shell (Navbar, Footer, RootLayout, …)
    feedback/  Loading, error, empty, toast, error boundary
  config/      Env + constants + routes
  context/     Cross-cutting providers (theme, toast)
  features/    Domain modules — each with api/ hooks/ components/ types
    cards/  recommendations/  questionnaire/  compare/  faq/
  hooks/       Reusable generic hooks
  lib/         Axios client, error normalization, query keys, utils
  pages/       Route-level pages (lazy-loaded)
  styles/      Global stylesheet + design tokens
  types/       Shared API types
```

### Highlights

- **Responsive** — mobile-first layouts across every page.
- **Dark mode** — class-based, persisted, respects OS preference; no flash on load.
- **Accessibility** — semantic landmarks, skip link, focus-visible rings, focus
  trapping in modals, `aria-*` wiring, reduced-motion support.
- **Loading / error / empty states** — every data view handles all three,
  with skeleton loaders that mirror final layouts.
- **Toasts** — custom, dependency-free toast system.
- **Data layer** — TanStack Query with a centralized key factory, sensible
  retry/staleness policy, and Axios error normalization.
- **Forms** — the questionnaire is a multi-step React Hook Form + Zod wizard with
  per-step validation.

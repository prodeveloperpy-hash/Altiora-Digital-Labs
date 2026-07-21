# CardWise frontend application overview

## Introduction

The CardWise frontend is the browser interface for discovering, comparing, and
receiving recommendations for credit cards. Customers use the public experience
to understand the catalog and find suitable products; authorized staff use the
protected administration area to maintain the data shown by the application.

It is a React 19 and TypeScript single-page application built with Vite. It does
not contain a mock product catalog: cards, categories, FAQs, recommendations,
and administration data are loaded from the CardWise backend API.

## Product goals

- Make a complex credit-card catalog understandable and searchable.
- Help users narrow choices through filters and side-by-side comparison.
- Collect preferences through a guided, validated questionnaire.
- Explain recommendations with scores, reasons, benefits, pros, cons, and
  eligibility information.
- Give administrators a consistent content-management interface.
- Provide responsive, accessible, typed, and failure-tolerant experiences.

## Technology

| Area | Technology | Responsibility |
| --- | --- | --- |
| Interface | React 19 | Components and interaction |
| Language | TypeScript | Static types and API contracts |
| Tooling | Vite | Development server, proxy, and bundling |
| Routing | React Router | Public and protected routes |
| Server state | TanStack Query | Fetching, caching, retries, and invalidation |
| HTTP | Axios | Centralized API requests |
| Forms | React Hook Form | Form state and submission |
| Validation | Zod | Runtime validation and typed schemas |
| Presentation | Tailwind CSS and styled-components | Layout and styling |

## Public pages

| Route | Page | Purpose |
| --- | --- | --- |
| `/` | Home | Product introduction, featured cards, and primary actions |
| `/search` | Card search | Search, filter, sort, and paginate the card catalog |
| `/cards/:id` | Card details | Display fees, rewards, benefits, issuer, and eligibility |
| `/questionnaire` | Questionnaire | Collect and validate recommendation preferences |
| `/recommendations` | Recommendations | Present ranked matches and explanations |
| `/compare` | Comparison | Compare selected cards side by side |
| `/faq` | FAQ | Display backend-managed common questions |
| `/about` | About | Explain CardWise and its purpose |

Unknown public paths render a dedicated not-found page. Public pages share the
`RootLayout`, navigation, footer, theme controls, scroll handling, feedback
components, and comparison tray.

## Main customer journeys

### Browse and compare

1. A user visits the home or search page.
2. Card hooks request data through the centralized API client.
3. The user searches or filters by category, network, credit score, annual fee,
   sort order, and pagination.
4. Cards can be added to the comparison context from multiple pages.
5. The comparison page requests full records for selected IDs and displays a
   structured comparison table.

### Get a recommendation

1. The user opens the multi-step questionnaire.
2. React Hook Form owns input state while Zod validates each step.
3. The questionnaire store preserves answers during the flow.
4. The recommendation hook submits the answers to the backend.
5. The results page displays ranking, match scores, reasons, benefits, pros,
   cons, and eligibility returned by the API.
6. Explicit loading, empty, and failure states keep the outcome understandable.

## Administration area

The standalone login page is `/admin/login`. `AdminAuthProvider` manages login,
logout, session restoration, access tokens, and rotating refresh tokens.
`ProtectedRoute` prevents unauthenticated access to the admin layout.

| Route | Responsibility |
| --- | --- |
| `/admin/dashboard` | Administrative summary and entry point |
| `/admin/cards` | List, create, edit, publish, and manage cards |
| `/admin/banks` | Manage issuing banks |
| `/admin/questions` | Manage questionnaire questions and ordering |
| `/admin/categories` | Manage card categories |
| `/admin/recommendation-rules` | Manage recommendation rules and catalog data |
| `/admin/settings` | Manage supported application settings |

The admin UI has its own responsive layout, sidebar, top bar, tables,
confirmation dialogs, reusable forms, tag inputs, and image upload controls.

## Application composition

```text
Frontend entry
└── AppProviders
    ├── TanStack Query client
    ├── Theme provider
    ├── Toast provider
    ├── Compare provider
    ├── Admin authentication provider
    └── React Router
        ├── RootLayout → public pages
        └── ProtectedRoute → AdminLayout → admin pages
```

All route pages are lazy-loaded. Public users do not download every admin page
upfront, and each page can be delivered as a separate application chunk.

## Source architecture

```text
frontend/src/
├── app/          Router, providers, and query-client configuration
├── components/
│   ├── admin/    Admin shell and shared management components
│   ├── feedback/ Loading, error, empty, toast, and route feedback
│   ├── layout/   Public navigation, footer, sections, and shell
│   └── ui/       Reusable interface primitives
├── config/       Environment values and constants
├── context/      Theme and toast state
├── features/
│   ├── admin/    Admin API, authentication, hooks, keys, and types
│   ├── cards/    Card API, queries, filters, UI, and types
│   ├── compare/  Comparison state and presentation
│   ├── faq/      FAQ API, query, and types
│   ├── questionnaire/ Form, state, schema, and types
│   └── recommendations/ API, query, result UI, and types
├── hooks/        Generic reusable hooks
├── lib/          Axios client, API errors, query keys, and utilities
├── pages/        Route-level public and admin screens
├── styles/       Global styles and design tokens
└── types/        Shared cross-feature types
```

See [Frontend folder structure](FOLDER_STRUCTURE.md) for ownership rules.

## API and data flow

```text
Page/component
    → feature query or mutation hook
    → feature API function
    → central Axios client
    → Vite development proxy
    → CardWise backend API
```

TanStack Query owns backend state, request status, caching, retries, and cache
invalidation. Components consume typed hooks instead of issuing unrelated HTTP
requests. Successful admin mutations invalidate the relevant query keys so
lists and detail views refresh from the server.

The API client is in `src/lib/apiClient.ts`; errors are normalized in
`src/lib/apiError.ts`; environment parsing is centralized in
`src/config/env.ts`.

## State ownership

- TanStack Query owns server data.
- React Hook Form owns active form fields.
- The questionnaire store preserves multi-step answers.
- Compare context owns selected card IDs.
- Theme context persists light/dark preference and respects the OS preference.
- Toast context owns transient notifications.
- Admin auth context owns authentication and session state.
- Components own short-lived presentation state.

This keeps server, form, authentication, and visual state separated.

## User interface behavior

The shared UI library includes buttons, cards, badges, inputs, selects,
checkboxes, sliders, text areas, modals, accordions, pagination, progress,
tooltips, ratings, skeletons, and spinners. The application also provides:

- Responsive layouts for desktop and mobile devices.
- Persisted light and dark themes.
- Loading skeletons shaped like their final content.
- Dedicated empty, error, route-error, and not-found experiences.
- Toast feedback for transient results.
- Keyboard focus indicators and modal focus management.
- Semantic landmarks, accessible labeling, and reduced-motion support.

## Environment and local API connection

The default frontend environment is:

```dotenv
VITE_API_BASE_URL=/api
VITE_DEV_API_PROXY=http://localhost:8000
VITE_API_TIMEOUT=15000
VITE_APP_NAME=Altiora Digital Labs
```

During local development, Vite forwards `/api/*` and `/uploads/*` to the
backend at port 8000. The browser remains on the frontend origin at port 5173.
Restart the development server after changing `.env`.

## Direction for making changes

| Goal | Primary location |
| --- | --- |
| Add or change a route | `src/app/router.tsx` |
| Add a page | `src/pages/` |
| Change a domain feature | `src/features/<feature>/` |
| Add a reusable control | `src/components/ui/` |
| Change the public shell | `src/components/layout/` |
| Change shared admin UI | `src/components/admin/` |
| Change HTTP behavior | `src/lib/apiClient.ts` |
| Change error handling | `src/lib/apiError.ts` |
| Add an environment value | `.env.example` and `src/config/env.ts` |
| Change global styles | `src/styles/` |

For a new feature:

1. Identify or create its domain under `src/features/`.
2. Define request and response types.
3. Add feature API functions.
4. Add TanStack Query hooks and centralized query keys.
5. Build feature-owned components.
6. Compose them in a route-level page.
7. Register a lazy route when required.
8. Handle loading, empty, error, and success states.
9. Reuse shared UI primitives before creating new ones.
10. Update frontend documentation when ownership or behavior changes.

## Running the frontend locally

Start the backend first, then follow the complete
[Frontend local development guide](LOCAL_DEVELOPMENT.md). The short Windows
PowerShell flow is:

```powershell
cd frontend
Copy-Item .env.example .env
npm install
npm run dev
```

Open <http://localhost:5173>. The backend should be reachable at
<http://localhost:8000>, and <http://localhost:8000/health> should succeed.

## Frontend documentation

- [Frontend overview](APP_OVERVIEW.md) — introduction, pages, architecture,
  journeys, state, and contributor direction.
- [Local development](LOCAL_DEVELOPMENT.md) — installation, commands,
  environment, verification, and troubleshooting.
- [Folder structure](FOLDER_STRUCTURE.md) — directory responsibilities.
- [Frontend README](../README.md) — concise reference and backend API contract.

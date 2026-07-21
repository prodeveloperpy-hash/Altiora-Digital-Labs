# CardWise — Backend API

A database-driven credit card recommendation service built with **Python 3.12,
FastAPI, SQLAlchemy 2, SQLite, Alembic, and Pydantic v2**.

The API powers the CardWise frontend: browsing/searching cards, comparing them,
serving FAQs, and — the centerpiece — generating **personalized recommendations
whose scoring comes entirely from database tables**. There is no hardcoded
scoring logic: weights, thresholds, targets, credit-tier rankings, reward
mappings, and the human-readable reasons all live in `recommendation_rules` and
its supporting lookup tables.

---

## Quick start

For complete native Python and Docker instructions, including verification,
tests, configuration, and troubleshooting, see
[Local development](docs/LOCAL_DEVELOPMENT.md).
For directory and layer responsibilities, see
[Backend folder structure](docs/FOLDER_STRUCTURE.md).

### Option A — Docker (recommended)

```bash
cd backend
docker compose up --build
```

The API is then available at **http://localhost:8000**, with interactive docs at
**http://localhost:8000/docs**. On first boot it applies migrations and seeds
reference data automatically.

### Option B — Local Python

```bash
cd backend
python -m venv .venv
# Windows:  .venv\Scripts\activate
# Unix:     source .venv/bin/activate
pip install -r requirements-dev.txt

# Create the schema and seed data (also happens automatically on startup):
alembic upgrade head
python -m app.database.seed

uvicorn app.main:app --reload
```

Visit **http://localhost:8000/docs** for Swagger UI (ReDoc at `/redoc`).

> The default database is a local SQLite file (`cardwise.db`). On startup the app
> ensures the schema exists and seeds reference data when the database is empty,
> so it works out of the box even without running Alembic manually.

---

## Configuration

All settings are environment variables (see `.env.example`); every value has a
sensible default.

| Variable                     | Default                               | Description                                  |
| ---------------------------- | ------------------------------------- | -------------------------------------------- |
| `DATABASE_URL`               | `sqlite:///./cardwise.db`             | SQLAlchemy database URL.                      |
| `API_PREFIX`                 | `/api`                                | Prefix for all API routes.                   |
| `ADMIN_API_KEY`              | unset                                 | Protects mutation endpoints via `X-API-Key`. Set in deployments. |
| `TRUST_PROXY_HEADERS`        | `false`                               | Trust `X-Forwarded-For`; enable only behind a trusted proxy. |
| `CORS_ORIGINS`               | `["http://localhost:5173", …]`        | Allowed CORS origins (JSON array).           |
| `RATE_LIMIT_ENABLED`         | `true`                                | Toggle rate limiting.                        |
| `RATE_LIMIT_REQUESTS`        | `100`                                 | Requests allowed per window per client.      |
| `RATE_LIMIT_WINDOW_SECONDS`  | `60`                                  | Rate-limit window length.                    |
| `RECOMMENDATION_RESULT_LIMIT`| `12`                                  | Max recommendations returned per request.    |
| `AUTO_CREATE_TABLES`         | `true`                                | Create missing tables on startup.            |
| `AUTO_SEED`                  | `true`                                | Seed reference data when the DB is empty.    |
| `LOG_LEVEL`                  | `INFO`                                | Logging level.                               |
| `CARDWISE_JWT_SECRET`        | dev placeholder                       | **Set in every deployment.** Signs admin JWTs. |
| `ACCESS_TOKEN_EXPIRE_MINUTES`| `30`                                  | Admin access-token lifetime.                 |
| `REFRESH_TOKEN_EXPIRE_DAYS`  | `2`                                   | Refresh-token lifetime for a normal session. |
| `REFRESH_TOKEN_REMEMBER_DAYS`| `30`                                  | Refresh-token lifetime with "remember me".   |
| `CARDWISE_DEFAULT_ADMIN_PASSWORD` | `ChangeMe!2024`                  | Password for the seeded default admin.       |
| `UPLOAD_DIR`                 | `uploads`                             | Directory for admin image uploads.           |
| `UPLOAD_MAX_BYTES`           | `5242880`                             | Max upload size (5 MB).                       |

---

## Admin panel

A JWT-protected admin API lives under `/api/admin` and powers the React admin
dashboard. All content — cards, banks, questions, categories, and **the
recommendation rules the engine loads at request time** — is editable here, so
changing recommendation behavior is a database update, never a code change.

- **Auth:** `POST /api/admin/auth/login` returns an access token + a rotating
  refresh token (persisted by `jti` so logout truly revokes the session).
  `refresh`, `logout`, and `me` complete the flow. Role-based authorization
  (`super_admin` > `admin` > `editor`) guards destructive actions.
- **Default administrator** (seeded idempotently on first run):
  username `admin`, password `ChangeMe!2024` (override with
  `CARDWISE_DEFAULT_ADMIN_PASSWORD`). **Change it immediately in any real
  deployment**, and always set `CARDWISE_JWT_SECRET`.
- **Resources:** `dashboard`, `cards` (+ `publish`/`unpublish`), `banks`,
  `questions` (+ `reorder`), `categories`, `recommendation-rules` (+ `catalog`),
  `settings`, and `uploads` (multipart image upload, served under `/uploads`).

---

## API endpoints

All paths are prefixed with `API_PREFIX` (default `/api`).

| Method                | Path                        | Description                                          |
| --------------------- | --------------------------- | ---------------------------------------------------- |
| `GET`                 | `/health`                   | Readiness (checks the database).                     |
| `GET`                 | `/cards`                    | List/search/filter/sort/paginate cards.              |
| `GET`                 | `/cards/featured`           | Featured cards.                                      |
| `GET`                 | `/cards/compare?ids=a,b,c`  | Fetch a set of cards (order preserved).              |
| `GET`                 | `/cards/{id}`               | Get a card by id or slug.                            |
| `POST`                | `/cards`                    | Create a card.                                       |
| `PUT` / `PATCH`       | `/cards/{id}`               | Update a card.                                       |
| `DELETE`              | `/cards/{id}`               | Delete a card.                                       |
| `GET`                 | `/categories`               | List categories with active-card counts.            |
| `POST`                | `/categories`               | Create a category.                                  |
| `POST`                | `/recommendations`          | Ranked, scored recommendations for answers.          |
| `GET`                 | `/faqs`                     | List FAQs.                                           |
| `POST`/`PATCH`/`DELETE`| `/faqs` / `/faqs/{id}`     | Manage FAQs.                                         |

Additionally, `GET /health` (root, no prefix) is a lightweight liveness probe.

### `GET /cards` query parameters

`search`, `category`, `network`, `creditScore`, `maxAnnualFee`, `noAnnualFee`,
`sort` (`recommended|rating|annualFee|apr|name`), `direction` (`asc|desc`),
`page`, `pageSize`. Responses use the paginated envelope
`{ items, page, pageSize, total, totalPages }`.

All responses use **camelCase** field names to match the frontend contract.

Mutation endpoints accept an `X-API-Key` header when `ADMIN_API_KEY` is set.
The key is optional only to keep local development and the sample test suite
frictionless; production deployments must provide a strong secret through the
deployment platform rather than committing it to Compose or source control.

### Errors

Errors return a consistent body the frontend understands:

```json
{ "message": "…", "code": "…", "errors": { "field": "message" } }
```

---

## The recommendation engine (independent, database-driven)

The engine lives in `app/recommendation_engine/` as a **self-contained module**
that depends only on the ORM models and a database session — not on FastAPI or
the service layer. You can drive it directly:

```python
from app.recommendation_engine import RecommendationEngine
output = RecommendationEngine(db).recommend(answers)  # answers: dict keyed by question
```

It is split into **mechanism** (code) and **policy** (data):

| File | Responsibility |
| --- | --- |
| `operators.py` | The fixed operator *vocabulary* — generic comparison primitives. No weights, thresholds, targets, or reason text. |
| `loader.py` | Loads **every** rule dynamically from SQLite at evaluation time and derives the user's mapped tokens from `question_mappings`. |
| `scoring.py` | The scoring algorithm: evaluate answers, compute weighted scores, determine eligibility, assemble explanations. |
| `engine.py` | Facade orchestrating load → evaluate → score → rank → explain; persists answers. |
| `types.py` | Plain dataclasses (`ScoredCard`, `Reason`, `MatchedBenefit`, `Eligibility`, …). |

### The database schema the engine reads

Everything that defines behavior is a table row:

- **`banks`** — card issuers.
- **`credit_cards`** — cards (with `bank_id`).
- **`benefits`** + **`card_benefit`** — structured, reusable benefits per card.
- **`reward_categories`** — normalized spend/reward category catalog.
- **`eligibility_rules`** — data-driven eligibility checks (global or per card).
- **`recommendation_rules`** — scoring rules: operator, fields, thresholds,
  base `points`, `weight_key`, optional `benefit_code`, `outcome` (pro/con), and
  the reason to show.
- **`scoring_weights`** — named weight multipliers (`points × weight.value`).
- **`question_mappings`** — map questionnaire answers → internal tokens
  (reward units, benefits) so the questionnaire can change without touching rules.
- **`scoring_matrix`** — quantitative/graded scoring contributions.
- **`user_answers`** — persisted submissions (auditability), one row per answer.
- **`credit_score_tiers`** — ordinal credit ranking used by eligibility.

### The scoring algorithm

1. **Load every rule** dynamically (`loader.py`) — rules, matrix, eligibility
   rules, weights, credit ranks, benefit catalog, question mappings.
2. **Evaluate user answers** against each active card via the operator vocabulary.
3. **Calculate weighted scores** — `raw = Σ (points|score × weight)`, including
   negative contributions from `con` rules.
4. **Rank cards** — eligible first, then by score (rating as tie-break); scores
   are normalized so the best eligible match is 100; ranking is 1-based.
5. **Explain every recommendation** — returning **overall score, matched
   benefits, reasons, pros, cons, eligibility, and ranking**.

### Future rule changes require database updates only

The operator set is a stable vocabulary; all *behavior* is data. To change the
engine you edit tables — **no source changes**:

| To… | Do this (SQL/data only) |
| --- | --- |
| Re-weight the primary-goal signal | `UPDATE scoring_weights SET value=… WHERE key='goal'` |
| Disable a rule | `UPDATE recommendation_rules SET is_active=0 WHERE code=…` |
| Add a new rule | `INSERT INTO recommendation_rules (…) VALUES (…)` |
| Change an eligibility threshold | `UPDATE eligibility_rules …` |
| Map a new questionnaire answer | `INSERT INTO question_mappings (…)` |

This is verified by tests (`app/tests/test_engine.py`): disabling a rule row or
zeroing a weight changes the output with no code change.

Seed data for all of the above is defined in `app/database/seed.py`. The
operator vocabulary is introspectable via
`app.recommendation_engine.available_operators()`.

---

## Architecture

```
backend/
  app/
    api/                  Routers + dependencies
      routes/             cards, categories, recommendations, faqs, health
    models/               SQLAlchemy ORM models
    schemas/              Pydantic v2 schemas (camelCase I/O)
    services/             Business logic
    repositories/         Data-access layer (queries)
    recommendation_engine/ Operators + engine (DB-driven scoring)
    database/             Base, session, seeding
    middleware/           Request logging, rate limiting
    tests/                Pytest suite
    config.py             Settings
    error_handlers.py     Consistent error responses
    main.py               App factory + wiring
  alembic/                Migrations
  Dockerfile / docker-compose.yml
  requirements.txt / requirements-dev.txt
```

**Layering:** `api → services → repositories/engine → models`. Routes never touch
the ORM directly; services orchestrate; repositories encapsulate queries.

---

## Database & migrations

```bash
alembic upgrade head           # apply migrations
alembic downgrade base         # roll back
alembic revision -m "message"  # create a new migration
python -m app.database.seed    # seed reference data (idempotent)
```

Migrations: `0001_initial` (core schema) and `0002_engine` (banks, benefits,
reward categories, eligibility rules, weights, question mappings, scoring matrix,
user answers, `credit_cards.bank_id`, and richer `recommendation_rules` columns).

Schema: `banks`, `credit_cards`, `categories`, `card_category`, `reward_rates`,
`benefits`, `card_benefit`, `reward_categories`, `faqs`, `recommendation_rules`,
`scoring_weights`, `question_mappings`, `scoring_matrix`, `eligibility_rules`,
`user_answers`, `credit_score_tiers`.

---

## Tests

```bash
pip install -r requirements-dev.txt
pytest
```

Tests run against an isolated in-memory SQLite database seeded with the same
reference data as production, and cover health checks, card
listing/search/filter/sort/pagination, CRUD, the recommendation engine
(including proof that results are data-driven), FAQs, and rate limiting.

---

## Notes

- **Swagger/OpenAPI:** `/docs` (Swagger UI), `/redoc` (ReDoc), `/openapi.json`.
- **Logging:** structured request logs with correlation ids and timing.
- **Rate limiting:** in-memory fixed-window per client IP, with
  `X-RateLimit-*` headers; docs and health checks are exempt.
- **Frontend contract:** response field names are camelCase to match the
  frontend's expected types exactly.
```

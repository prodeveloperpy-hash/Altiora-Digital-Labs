# Backend folder structure

This document explains the main directories in the FastAPI and SQLAlchemy
backend. Generated caches, the virtual environment, and the SQLite database are
omitted.

```text
backend/
├── alembic/                       Database migration environment
│   └── versions/                  Versioned migration scripts
├── app/                           Backend application source
│   ├── api/                       FastAPI routers and dependencies
│   ├── core/                      Shared core application utilities
│   ├── database/                  Session, database base, and seed data
│   ├── middleware/                Request logging and rate limiting
│   ├── models/                    SQLAlchemy ORM models
│   ├── recommendation_engine/     Database-driven scoring engine
│   ├── repositories/              Database query and persistence layer
│   ├── schemas/                   Pydantic request and response models
│   ├── services/                  Business workflows and orchestration
│   ├── tests/                     Pytest test suite
│   ├── config.py                  Environment-backed settings
│   └── main.py                    FastAPI application entry point
├── docs/                          Project documentation
│   ├── FOLDER_STRUCTURE.md        This folder reference
│   └── LOCAL_DEVELOPMENT.md       Local setup and commands
├── uploads/                       Locally stored uploaded files
├── .env.example                  Safe environment-variable template
├── alembic.ini                   Alembic configuration
├── docker-compose.yml            Local container orchestration
├── Dockerfile                    Backend container image definition
├── pyproject.toml                Python tool configuration
├── requirements.txt              Runtime dependencies
├── requirements-dev.txt          Development and test dependencies
└── README.md                     Backend architecture and API reference
```

## Layer ownership

The normal request flow is:

```text
API route → service → repository or recommendation engine → ORM model/database
```

- `api/` handles HTTP input, dependency injection, and response delivery.
- `services/` owns business workflows and coordinates lower layers.
- `repositories/` owns reusable database access.
- `recommendation_engine/` owns recommendation evaluation and scoring.
- `models/` defines persisted entities; `schemas/` defines API data shapes.
- `database/` owns connections, sessions, and initial data.
- `tests/` mirrors and verifies externally visible behavior.

See [Local development](LOCAL_DEVELOPMENT.md) for Python and Docker commands.

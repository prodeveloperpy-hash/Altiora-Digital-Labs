#!/usr/bin/env bash
set -euo pipefail

# Apply database migrations (schema). The app also ensures schema/seed on
# startup, but running migrations here keeps a production DB properly versioned.
echo "Applying database migrations..."
alembic upgrade head

echo "Starting CardWise API..."
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"

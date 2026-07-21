"""Database package.

Importing this package ensures the declarative Base and all models are loaded,
so `Base.metadata` is complete for migrations and `create_all`.
"""

# Ensure all models are registered on Base.metadata.
import app.models  # noqa: E402,F401
from app.database.base import Base
from app.database.session import SessionLocal, engine, get_db

__all__ = ["Base", "SessionLocal", "engine", "get_db"]

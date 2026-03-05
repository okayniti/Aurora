"""
AURORA Shared Dependencies
FastAPI dependency injection for database sessions and services.
"""

from app.database.connection import get_db_session


async def get_db():
    """Yield an async database session."""
    async for session in get_db_session():
        yield session

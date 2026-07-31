"""
AURORA Shared Dependencies
FastAPI dependency injection for database sessions, authentication and authorization.
"""

from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from jose import jwt, JWTError

from app.database.connection import get_db_session
from app.config import settings

security = HTTPBearer()


def _credentials_error() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )


def _forbidden() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Not authorized to access this resource",
    )


async def get_db():
    """Yield an async database session."""
    async for session in get_db_session():
        yield session


def decode_token_subject(token: str) -> str:
    """Return the `sub` claim of a valid token, or raise 401."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        raise _credentials_error()

    user_id = payload.get("sub")
    if user_id is None:
        raise _credentials_error()
    return user_id


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
):
    """Resolve the authenticated user from the bearer token."""
    from app.database.models import User

    user_id = decode_token_subject(credentials.credentials)
    user = await db.get(User, user_id)
    if user is None:
        raise _credentials_error()
    return user


async def require_path_user(user_id: UUID, current_user=Depends(get_current_user)):
    """Guard routes carrying a `{user_id}` path param — it must be the caller."""
    if current_user.id != user_id:
        raise _forbidden()
    return current_user


async def require_task_owner(
    task_id: UUID,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Guard routes carrying a `{task_id}` path param — the task must be the caller's."""
    from app.database.models import Task

    task = await db.get(Task, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.user_id != current_user.id:
        raise _forbidden()
    return task

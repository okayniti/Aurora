"""
AURORA Shared Dependencies
FastAPI dependency injection for database sessions and services.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from jose import jwt, JWTError

from app.database.connection import get_db_session
from app.config import settings

security = HTTPBearer()

async def get_db():
    """Yield an async database session."""
    async for session in get_db_session():
        yield session

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: AsyncSession = Depends(get_db)):
    """Extract and validate JWT to get current user."""
    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    from app.database.models import User
    user = await db.get(User, user_id)
    if user is None:
        raise credentials_exception
    return user

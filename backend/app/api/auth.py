"""
AURORA API — Authentication Endpoints
The only routes in the API that do not require an existing bearer token.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr, Field

from app.database.models import User
from app.core.security import verify_password, get_password_hash, create_access_token
from app.dependencies import get_db, get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])


class RegisterReq(BaseModel):
    email: EmailStr
    # 72 bytes is bcrypt's hard ceiling — see app.core.security.
    password: str = Field(..., min_length=8, max_length=72)
    name: str = "User"


class LoginReq(BaseModel):
    email: EmailStr
    password: str


def _session_payload(user: User) -> dict:
    return {
        "access_token": create_access_token(data={"sub": str(user.id)}),
        "token_type": "bearer",
        "user": _user_payload(user),
    }


def _user_payload(user: User) -> dict:
    return {
        "id": str(user.id),
        "email": user.email,
        "name": user.name,
        "identity_desc": user.identity_desc,
    }


@router.post("/register")
async def register_user(req: RegisterReq, db: AsyncSession = Depends(get_db)):
    """Create an account and return a session for it."""
    result = await db.execute(select(User).where(User.email == req.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(email=req.email, name=req.name, password_hash=get_password_hash(req.password))
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return _session_payload(user)


@router.post("/login")
async def login_user(req: LoginReq, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalars().first()
    if not user or not user.password_hash or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return _session_payload(user)


@router.get("/me")
async def read_users_me(current_user: User = Depends(get_current_user)):
    return _user_payload(current_user)

"""
AURORA — FastAPI Application Entry Point
Adaptive Unified Reinforcement Optimized Routine Architect
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.middleware import RequestTimingMiddleware
from app.api.router import api_router
from app.database.connection import init_db
from app.utils.logger import setup_logger

logger = setup_logger("aurora.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle: startup and shutdown events."""
    logger.info("🌅 AURORA starting up...")
    await init_db()
    logger.info("✅ Database initialized")
    logger.info(f"🚀 AURORA v{settings.APP_VERSION} is ready")
    yield
    logger.info("🌙 AURORA shutting down...")


app = FastAPI(
    title="AURORA API",
    description=(
        "Adaptive Unified Reinforcement Optimized Routine Architect — "
        "An AI-powered behavioral intelligence system for daily execution optimization."
    ),
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request timing
app.add_middleware(RequestTimingMiddleware)

# Mount routes
app.include_router(api_router)


# Health check
@app.get("/api/health", tags=["System"])
async def health_check():
    """Service health check endpoint."""
    return {
        "status": "healthy",
        "service": "AURORA",
        "version": settings.APP_VERSION,
    }


# User creation endpoint (for bootstrapping)
@app.post("/api/users", tags=["Users"])
async def create_user(email: str, name: str, identity_desc: str = None):
    """Create a new user."""
    from app.database.connection import async_session_factory
    from app.database.models import User

    async with async_session_factory() as session:
        user = User(email=email, name=name, identity_desc=identity_desc)
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return {"id": str(user.id), "email": email, "name": name}


@app.get("/api/users", tags=["Users"])
async def list_users():
    """List all users — used by frontend to auto-discover demo user."""
    from sqlalchemy import select
    from app.database.connection import async_session_factory
    from app.database.models import User

    async with async_session_factory() as session:
        result = await session.execute(select(User))
        users = result.scalars().all()
        return [
            {"id": str(u.id), "email": u.email, "name": u.name}
            for u in users
        ]


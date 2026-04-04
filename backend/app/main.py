"""
AURORA — FastAPI Application Entry Point
Adaptive Unified Reinforcement Optimized Routine Architect
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.utils.limiter import limiter
from app.config import settings
from app.middleware import RequestTimingMiddleware
from app.api.router import api_router
from app.database.connection import init_db
from app.utils.logger import setup_logger

from app.ml.energy_model.inference import EnergyPredictor
from app.ml.burnout_model.inference import BurnoutPredictor
from app.ml.identity_engine.embeddings import EmbeddingService
from app.ml.rl_scheduler.inference import ScheduleOptimizer

logger = setup_logger("aurora.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle: startup and shutdown events."""
    logger.info("🌅 AURORA starting up...")
    await init_db()
    logger.info("✅ Database initialized")

    logger.info("🧠 Loading ML Models globally...")
    app.state.energy_predictor = EnergyPredictor()
    app.state.burnout_predictor = BurnoutPredictor()
    
    embedding_service = EmbeddingService()
    embedding_service.load_model()
    app.state.embedding_service = embedding_service
    
    app.state.schedule_optimizer = ScheduleOptimizer()
    logger.info("✅ ML Models loaded into memory")

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
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate Limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Validation Error Handler
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    field = ".".join(str(loc) for loc in errors[0]["loc"]) if errors else "unknown"
    return JSONResponse(
        status_code=422,
        content={
            "error": "Validation Error",
            "field": field,
            "received": exc.body
        }
    )

# Request timing
app.add_middleware(RequestTimingMiddleware)

# Mount routes
app.include_router(api_router)


# Health check
@app.get("/api/health", tags=["System"])
async def health_check():
    """Service health check endpoint."""
    from app.database.connection import async_session_factory
    from sqlalchemy import text
    from datetime import datetime
    try:
        async with async_session_factory() as session:
            await session.execute(text("SELECT 1"))
    except Exception as e:
        logger.error(f"Database health check failed: {e}", exc_info=True)
        from fastapi import HTTPException
        raise HTTPException(status_code=503, detail="Database unreachable")

    return {
        "status": "healthy",
        "database": "connected",
        "model": "loaded",
        "service": "AURORA",
        "version": settings.APP_VERSION,
        "timestamp": datetime.utcnow().isoformat()
    }


# User creation endpoint (for bootstrapping)
@app.post("/api/users", tags=["Users"])
@limiter.limit("20/minute")
async def create_user(request: Request, email: str, name: str, identity_desc: str = None):
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


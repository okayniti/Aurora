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
from app.ml.replanning.engine import ReplanEngine

logger = setup_logger("aurora.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle: startup and shutdown events."""
    logger.info("🌅 AURORA starting up...")
    # Ensure models are imported so Base.metadata is populated before creating tables
    from app.database import models  # noqa: F401
    await init_db()
    logger.info("✅ Database initialized")

    logger.info("🧠 Loading ML Models globally...")
    app.state.energy_predictor = EnergyPredictor()
    app.state.burnout_predictor = BurnoutPredictor()
    
    embedding_service = EmbeddingService()
    embedding_service.load_model()
    app.state.embedding_service = embedding_service
    
    app.state.schedule_optimizer = ScheduleOptimizer()
    app.state.replan_engine = ReplanEngine()
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
    # Never echo exc.body back: on a failed registration or login it contains the
    # submitted plaintext password. Report which field failed and why, nothing more.
    errors = exc.errors()
    first = errors[0] if errors else {}
    field = ".".join(str(loc) for loc in first.get("loc", ())) or "unknown"
    reason = first.get("msg", "Invalid value")
    return JSONResponse(
        status_code=422,
        content={
            "error": "Validation Error",
            "field": field,
            # `detail` matches FastAPI's HTTPException shape so clients read one key.
            "detail": f"{field}: {reason}",
        },
    )

# Request timing
app.add_middleware(RequestTimingMiddleware)

# Mount routes
app.include_router(api_router)

from app.api.auth import router as auth_router
app.include_router(auth_router, prefix="/api")

from app.utils.websocket import manager
from fastapi import WebSocket, WebSocketDisconnect

@app.websocket("/api/ws/replan")
async def websocket_endpoint(websocket: WebSocket, token: str = ""):
    """Replan event stream. The token is passed as a query param because the
    browser WebSocket API cannot set an Authorization header."""
    from fastapi import HTTPException
    from app.dependencies import decode_token_subject

    try:
        user_id = decode_token_subject(token)
    except HTTPException:
        await websocket.close(code=1008)
        return

    await manager.connect(websocket, user_id)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)


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


# NOTE: the former unauthenticated /api/users endpoints were removed. Listing every
# user's email let any caller enumerate accounts, and the POST variant created
# password-less users the login flow could never own. Accounts are now created
# through POST /api/auth/register, and the client identifies itself via
# GET /api/auth/me.


"""
AURORA API — Burnout Endpoints
"""

from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
import time

from app.utils.cache import api_cache

from app.dependencies import get_db
from app.database.schemas import BurnoutSnapshotCreate
from app.services.burnout_service import BurnoutService

from app.utils.limiter import limiter

router = APIRouter(prefix="/burnout", tags=["Burnout Risk"])
service = BurnoutService()


@router.get("/risk/{user_id}")
async def get_burnout_risk(
    request: Request,
    response: Response,
    user_id: UUID,
    sleep_trend: float = None,
    deep_work_streak: int = None,
    stress_trend: float = None,
    energy_variance: float = None,
    cognitive_load: float = None,
    db: AsyncSession = Depends(get_db),
):
    """Get current burnout risk prediction with explainability."""
    response.headers["Cache-Control"] = "max-age=30"
    
    cache_key = f"burnout_risk_{user_id}_{sleep_trend}_{deep_work_streak}_{stress_trend}_{energy_variance}_{cognitive_load}"
    cached = api_cache.get(cache_key)
    if cached:
        return cached

    result = await service.get_risk(
        db, user_id, request.app.state.burnout_predictor, sleep_trend, deep_work_streak,
        stress_trend, energy_variance, cognitive_load,
    )
    api_cache.set(cache_key, result)
    return result


@router.get("/trend/{user_id}")
async def get_burnout_trend(
    user_id: UUID, days: int = 30, db: AsyncSession = Depends(get_db)
):
    """Get burnout trend over past N days."""
    return await service.get_trend(db, user_id, days)


@router.post("/snapshot")
@limiter.limit("20/minute")
async def record_burnout_snapshot(
    request: Request, data: BurnoutSnapshotCreate, db: AsyncSession = Depends(get_db)
):
    """Record burnout indicator values."""
    return await service.get_risk(
        db, data.user_id, request.app.state.burnout_predictor, data.sleep_trend, data.deep_work_streak,
        data.stress_trend, data.energy_variance, data.cognitive_load,
    )


@router.get("/snapshot/{user_id}/latest")
async def get_latest_burnout_snapshot(user_id: UUID, db: AsyncSession = Depends(get_db)):
    """Return the latest raw burnout snapshot for UI initialization."""
    return await service.get_latest_snapshot(db, user_id)

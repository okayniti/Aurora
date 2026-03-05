"""
AURORA API — Burnout Endpoints
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.dependencies import get_db
from app.database.schemas import BurnoutSnapshotCreate
from app.services.burnout_service import BurnoutService

router = APIRouter(prefix="/burnout", tags=["Burnout Risk"])
service = BurnoutService()


@router.get("/risk/{user_id}")
async def get_burnout_risk(
    user_id: UUID,
    sleep_trend: float = 7.0,
    deep_work_streak: int = 0,
    stress_trend: float = 0.3,
    energy_variance: float = 1.0,
    cognitive_load: float = 5.0,
    db: AsyncSession = Depends(get_db),
):
    """Get current burnout risk prediction with explainability."""
    return await service.get_risk(
        db, user_id, sleep_trend, deep_work_streak,
        stress_trend, energy_variance, cognitive_load,
    )


@router.get("/trend/{user_id}")
async def get_burnout_trend(
    user_id: UUID, days: int = 30, db: AsyncSession = Depends(get_db)
):
    """Get burnout trend over past N days."""
    return await service.get_trend(db, user_id, days)


@router.post("/snapshot")
async def record_burnout_snapshot(
    data: BurnoutSnapshotCreate, db: AsyncSession = Depends(get_db)
):
    """Record burnout indicator values."""
    return await service.get_risk(
        db, data.user_id, data.sleep_trend, data.deep_work_streak,
        data.stress_trend, data.energy_variance, data.cognitive_load,
    )

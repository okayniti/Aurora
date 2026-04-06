"""
AURORA API — Energy Endpoints
"""

from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from datetime import date
import time

MODEL_CACHE = {}

from app.dependencies import get_db
from app.database.schemas import EnergyLogCreate, EnergyForecastResponse
from app.services.energy_service import EnergyService

from app.utils.limiter import limiter

router = APIRouter(prefix="/energy", tags=["Energy Forecasting"])
service = EnergyService()


@router.get("/forecast/{user_id}")
async def get_energy_forecast(request: Request, response: Response, user_id: UUID, db: AsyncSession = Depends(get_db)):
    """Get 24-hour energy level predictions."""
    response.headers["Cache-Control"] = "max-age=30"
    
    cache_key = str(user_id)
    now = time.time()
    if cache_key in MODEL_CACHE and now - MODEL_CACHE[cache_key][0] < 60:
        return MODEL_CACHE[cache_key][1]

    result = await service.get_forecast(db, user_id, predictor=request.app.state.energy_predictor)
    MODEL_CACHE[cache_key] = (now, result)
    return result


@router.post("/log")
@limiter.limit("20/minute")
async def log_energy(request: Request, data: EnergyLogCreate, db: AsyncSession = Depends(get_db)):
    """Log an actual energy level reading."""
    return await service.log_energy(
        db, data.user_id, data.energy_level,
        data.sleep_hours, data.caffeine_intake, data.exercise_mins,
        data.timestamp,
    )


@router.get("/history/{user_id}")
async def get_energy_history(user_id: UUID, days: int = 7, db: AsyncSession = Depends(get_db)):
    """Get historical energy data."""
    return await service.get_history(db, user_id, days)


@router.get("/comparison/{user_id}")
async def get_energy_comparison(
    user_id: UUID, target_date: date = None, db: AsyncSession = Depends(get_db)
):
    """Get predicted vs actual energy comparison."""
    return await service.get_comparison(db, user_id, target_date)

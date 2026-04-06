"""
AURORA API — Scheduler Endpoints
"""

from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from datetime import date
import time

MODEL_CACHE = {}

from app.dependencies import get_db
from app.database.schemas import ScheduleOptimizeRequest, SchedulerFeedback
from app.services.scheduler_service import SchedulerService

from app.utils.limiter import limiter

router = APIRouter(prefix="/scheduler", tags=["RL Scheduler"])
service = SchedulerService()


@router.post("/optimize/{user_id}")
@limiter.limit("20/minute")
async def optimize_schedule(
    request: Request, user_id: UUID,
    data: ScheduleOptimizeRequest = ScheduleOptimizeRequest(),
    db: AsyncSession = Depends(get_db),
):
    """Run RL agent to generate optimized daily schedule."""
    cache_key = str(user_id)
    now = time.time()
    if cache_key in MODEL_CACHE and now - MODEL_CACHE[cache_key][0] < 60:
        return MODEL_CACHE[cache_key][1]

    result = await service.optimize_schedule(
        db, user_id, 
        request.app.state.schedule_optimizer, 
        request.app.state.energy_predictor, 
        data.date
    )
    MODEL_CACHE[cache_key] = (now, result)
    return result


@router.get("/schedule/{user_id}")
async def get_schedule(
    user_id: UUID, target_date: date = None, db: AsyncSession = Depends(get_db)
):
    """Get optimized schedule for a given day."""
    return await service.get_schedule(db, user_id, target_date)


@router.post("/feedback")
@limiter.limit("20/minute")
async def submit_feedback(request: Request, data: SchedulerFeedback, db: AsyncSession = Depends(get_db)):
    """Submit reward signal (task completed or missed)."""
    from app.database.models import ScheduleEntry
    entry = await db.get(ScheduleEntry, data.schedule_entry_id)
    if entry:
        entry.was_completed = data.was_completed
        return {"status": "feedback_recorded"}
    return {"error": "Schedule entry not found"}


@router.get("/efficiency/{user_id}")
async def get_rl_efficiency(user_id: UUID, db: AsyncSession = Depends(get_db)):
    """Get RL strategy efficiency metrics."""
    from app.database.models import ScheduleEntry
    from sqlalchemy import select, and_
    query = select(ScheduleEntry).where(
        and_(ScheduleEntry.user_id == user_id, ScheduleEntry.date == date.today())
    )
    result = await db.execute(query)
    entries = result.scalars().all()

    total = len(entries)
    completed = len([e for e in entries if e.was_completed])

    return {
        "user_id": str(user_id),
        "avg_reward": 0.0,
        "completion_rate": completed / total if total else 0.0,
        "burnout_avoidance_rate": 1.0,
        "schedule_adherence": completed / total if total else 0.0,
    }

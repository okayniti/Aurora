"""
AURORA API — Scheduler Endpoints
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from datetime import date

from app.dependencies import get_db
from app.database.schemas import ScheduleOptimizeRequest, SchedulerFeedback
from app.services.scheduler_service import SchedulerService

router = APIRouter(prefix="/scheduler", tags=["RL Scheduler"])
service = SchedulerService()


@router.post("/optimize/{user_id}")
async def optimize_schedule(
    user_id: UUID,
    request: ScheduleOptimizeRequest = ScheduleOptimizeRequest(),
    db: AsyncSession = Depends(get_db),
):
    """Run RL agent to generate optimized daily schedule."""
    return await service.optimize_schedule(db, user_id, request.date)


@router.get("/schedule/{user_id}")
async def get_schedule(
    user_id: UUID, target_date: date = None, db: AsyncSession = Depends(get_db)
):
    """Get optimized schedule for a given day."""
    return await service.get_schedule(db, user_id, target_date)


@router.post("/feedback")
async def submit_feedback(data: SchedulerFeedback, db: AsyncSession = Depends(get_db)):
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

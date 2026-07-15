"""
AURORA API — Replanning Endpoints
"""

from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.dependencies import get_db
from app.database.schemas import ReplanTriggerRequest
from app.database.models import ReplanEvent

from app.utils.limiter import limiter

router = APIRouter(prefix="/replan", tags=["Dynamic Replanning"])


@router.post("/trigger")
@limiter.limit("20/minute")
async def trigger_replan(request: Request, data: ReplanTriggerRequest, db: AsyncSession = Depends(get_db)):
    """Manually trigger a schedule replan."""
    from app.ml.energy_model.inference import EnergyPredictor
    from app.database.models import Task
    from sqlalchemy import select, and_
    from datetime import datetime

    engine = request.app.state.replan_engine
    predictor = request.app.state.energy_predictor

    # Get remaining tasks
    query = select(Task).where(
        and_(Task.user_id == data.user_id, Task.status.in_(["pending", "in_progress"]))
    )
    result = await db.execute(query)
    tasks = result.scalars().all()

    task_dicts = [
        {
            "id": str(t.id), "title": t.title,
            "difficulty": t.difficulty or 5.0,
            "estimated_minutes": t.estimated_minutes or 60,
            "priority": t.priority or 3,
        }
        for t in tasks
    ]

    # Get energy forecast
    forecast = predictor.predict()
    energy = [p["energy"] for p in forecast["hourly_predictions"]]
    while len(energy) < 24:
        energy.append(5.0)

    trigger = {
        "trigger_type": data.trigger_type,
        "trigger_data": data.trigger_data or {},
    }

    replan_result = engine.replan(
        current_schedule=[], remaining_tasks=task_dicts,
        trigger=trigger, energy_forecast=energy,
        burnout_probability=0.3, current_hour=datetime.utcnow().hour,
    )

    # Log replan event
    event = ReplanEvent(
        user_id=data.user_id,
        trigger_type=data.trigger_type,
        trigger_data=data.trigger_data,
        tasks_affected=replan_result.get("tasks_affected", 0),
    )
    db.add(event)

    # Broadcast replan event to frontend via WebSocket
    from app.utils.websocket import manager
    await manager.broadcast({
        "type": "replan",
        "user_id": str(data.user_id),
        "trigger_type": data.trigger_type,
        "tasks_affected": replan_result.get("tasks_affected", 0),
    })

    return replan_result


@router.get("/events/{user_id}")
async def get_replan_events(user_id: UUID, db: AsyncSession = Depends(get_db)):
    """Get replan event history."""
    from sqlalchemy import select
    query = select(ReplanEvent).where(
        ReplanEvent.user_id == user_id
    ).order_by(ReplanEvent.timestamp.desc()).limit(50)

    result = await db.execute(query)
    events = result.scalars().all()

    return [
        {
            "id": str(e.id),
            "trigger_type": e.trigger_type,
            "trigger_data": e.trigger_data,
            "tasks_affected": e.tasks_affected,
            "timestamp": e.timestamp.isoformat(),
        }
        for e in events
    ]

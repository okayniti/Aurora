"""
AURORA Scheduler Service
Business logic for RL-based schedule optimization.
"""

from datetime import datetime, date, timedelta
from typing import Dict, List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
import logging

from app.database.models import Task, ScheduleEntry
from app.ml.rl_scheduler.inference import ScheduleOptimizer
from app.ml.energy_model.inference import EnergyPredictor

logger = logging.getLogger("aurora.services.scheduler")


class SchedulerService:
    def __init__(self):
        self.optimizer = ScheduleOptimizer()
        self.energy_predictor = EnergyPredictor()

    async def optimize_schedule(
        self, session: AsyncSession, user_id: UUID,
        target_date: date = None,
    ) -> Dict:
        """Generate optimized schedule for a day."""
        target_date = target_date or date.today()

        # Fetch pending tasks
        query = select(Task).where(
            and_(Task.user_id == user_id, Task.status.in_(["pending", "in_progress"]))
        )
        result = await session.execute(query)
        tasks = result.scalars().all()

        task_dicts = [
            {
                "id": str(t.id),
                "title": t.title,
                "difficulty": t.difficulty or 5.0,
                "estimated_minutes": t.estimated_minutes or 60,
                "priority": t.priority or 3,
                "identity_alignment": t.identity_alignment or 0.5,
                "status": t.status,
            }
            for t in tasks
        ]

        # Get energy forecast
        energy_result = self.energy_predictor.predict()
        energy_forecast = [p["energy"] for p in energy_result["hourly_predictions"]]

        # Pad to 24 hours if needed
        while len(energy_forecast) < 24:
            energy_forecast.append(5.0)

        # Optimize
        schedule = self.optimizer.optimize(
            tasks=task_dicts,
            energy_forecast=energy_forecast,
            burnout_probability=0.3,
        )

        schedule["user_id"] = str(user_id)
        schedule["date"] = target_date.isoformat()
        return schedule

    async def get_schedule(
        self, session: AsyncSession, user_id: UUID, target_date: date = None
    ) -> Dict:
        """Get existing schedule for a day."""
        target_date = target_date or date.today()

        query = select(ScheduleEntry).where(
            and_(ScheduleEntry.user_id == user_id, ScheduleEntry.date == target_date)
        ).order_by(ScheduleEntry.time_slot_start)

        result = await session.execute(query)
        entries = result.scalars().all()

        return {
            "user_id": str(user_id),
            "date": target_date.isoformat(),
            "entries": [
                {
                    "id": str(e.id),
                    "task_id": str(e.task_id),
                    "time_slot_start": e.time_slot_start.isoformat(),
                    "time_slot_end": e.time_slot_end.isoformat(),
                    "rl_confidence": e.rl_confidence,
                    "was_completed": e.was_completed,
                    "replan_count": e.replan_count,
                }
                for e in entries
            ],
        }

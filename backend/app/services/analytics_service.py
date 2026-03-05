"""
AURORA Analytics Service
Aggregates data for the Cognitive Analytics Dashboard.
"""

from datetime import datetime, date, timedelta
from typing import Dict
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
import logging

from app.database.models import (
    Task, EnergyLog, BurnoutSnapshot, AnalyticsDaily, ScheduleEntry
)

logger = logging.getLogger("aurora.services.analytics")


class AnalyticsService:

    async def get_dashboard(
        self, session: AsyncSession, user_id: UUID
    ) -> Dict:
        """Aggregate all dashboard metrics for today."""
        today = date.today()

        # Tasks stats
        task_query = select(Task).where(
            and_(Task.user_id == user_id, Task.created_at >= datetime.combine(today, datetime.min.time()))
        )
        result = await session.execute(task_query)
        tasks = result.scalars().all()
        total_tasks = len(tasks)
        completed_tasks = len([t for t in tasks if t.status == "done"])

        # Deep work hours (tasks labeled as deep work, or just completed tasks' actual minutes)
        deep_work_mins = sum(t.actual_minutes or 0 for t in tasks if t.status == "done")
        deep_work_hours = round(deep_work_mins / 60.0, 1)

        # Identity alignment average
        alignments = [t.identity_alignment for t in tasks if t.identity_alignment is not None]
        alignment_avg = round(sum(alignments) / len(alignments) * 100, 1) if alignments else 0.0

        # Latest burnout snapshot
        burnout_query = select(BurnoutSnapshot).where(
            BurnoutSnapshot.user_id == user_id
        ).order_by(BurnoutSnapshot.timestamp.desc()).limit(1)
        burnout_result = await session.execute(burnout_query)
        burnout_snap = burnout_result.scalar_one_or_none()
        burnout_trend = burnout_snap.burnout_probability if burnout_snap else 0.0

        # Decision fatigue index (increases with number of tasks and decisions)
        decision_fatigue = min(1.0, total_tasks * 0.05 + completed_tasks * 0.03)

        # RL efficiency (schedule adherence)
        schedule_query = select(ScheduleEntry).where(
            and_(ScheduleEntry.user_id == user_id, ScheduleEntry.date == today)
        )
        sched_result = await session.execute(schedule_query)
        schedule_entries = sched_result.scalars().all()
        if schedule_entries:
            completed_scheduled = len([s for s in schedule_entries if s.was_completed])
            rl_efficiency = completed_scheduled / len(schedule_entries)
        else:
            rl_efficiency = 0.0

        return {
            "user_id": str(user_id),
            "date": today.isoformat(),
            "deep_work_hours": deep_work_hours,
            "identity_alignment_avg": alignment_avg,
            "burnout_trend": round(burnout_trend, 3),
            "energy_forecast_mae": 0.0,  # Computed when comparison data available
            "decision_fatigue_index": round(decision_fatigue, 3),
            "rl_strategy_efficiency": round(rl_efficiency, 3),
            "tasks_completed": completed_tasks,
            "tasks_total": total_tasks,
        }

    async def get_daily_analytics(
        self, session: AsyncSession, user_id: UUID, target_date: date = None
    ) -> Dict:
        """Get analytics for a specific day."""
        target_date = target_date or date.today()

        query = select(AnalyticsDaily).where(
            and_(AnalyticsDaily.user_id == user_id, AnalyticsDaily.date == target_date)
        )
        result = await session.execute(query)
        analytics = result.scalar_one_or_none()

        if analytics:
            return {
                "user_id": str(user_id),
                "date": target_date.isoformat(),
                "deep_work_hours": analytics.deep_work_hours,
                "identity_alignment_avg": analytics.identity_alignment_avg,
                "burnout_trend": analytics.burnout_trend,
                "energy_forecast_mae": analytics.energy_forecast_mae,
                "decision_fatigue_index": analytics.decision_fatigue_index,
                "rl_strategy_efficiency": analytics.rl_strategy_efficiency,
                "tasks_completed": analytics.tasks_completed,
                "tasks_total": analytics.tasks_total,
            }
        else:
            # Compute live
            return await self.get_dashboard(session, user_id)

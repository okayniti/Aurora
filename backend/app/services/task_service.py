"""
AURORA Task Service
CRUD operations for tasks.
"""

from datetime import datetime
from typing import Dict, List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, update
import logging

from app.database.models import Task

logger = logging.getLogger("aurora.services.task")


class TaskService:

    async def create_task(
        self, session: AsyncSession, user_id: UUID,
        title: str, description: str = None, difficulty: float = None,
        estimated_minutes: int = None, priority: int = 3,
        category: str = None, scheduled_start: datetime = None,
        scheduled_end: datetime = None,
    ) -> Dict:
        """Create a new task."""
        task = Task(
            user_id=user_id,
            title=title,
            description=description,
            difficulty=difficulty,
            estimated_minutes=estimated_minutes,
            priority=priority,
            category=category,
            scheduled_start=scheduled_start,
            scheduled_end=scheduled_end,
        )
        session.add(task)
        await session.flush()

        return {
            "id": str(task.id),
            "title": title,
            "priority": priority,
            "status": "pending",
        }

    async def get_tasks(
        self, session: AsyncSession, user_id: UUID,
        status: str = None, category: str = None,
    ) -> List[Dict]:
        """Get user tasks with optional filters."""
        query = select(Task).where(Task.user_id == user_id)
        if status:
            query = query.where(Task.status == status)
        if category:
            query = query.where(Task.category == category)
        query = query.order_by(Task.priority.desc(), Task.created_at)

        result = await session.execute(query)
        tasks = result.scalars().all()

        return [
            {
                "id": str(t.id),
                "title": t.title,
                "description": t.description,
                "difficulty": t.difficulty,
                "estimated_minutes": t.estimated_minutes,
                "actual_minutes": t.actual_minutes,
                "priority": t.priority,
                "category": t.category,
                "status": t.status,
                "identity_alignment": t.identity_alignment,
                "scheduled_start": t.scheduled_start.isoformat() if t.scheduled_start else None,
                "scheduled_end": t.scheduled_end.isoformat() if t.scheduled_end else None,
                "created_at": t.created_at.isoformat(),
            }
            for t in tasks
        ]

    async def update_task(
        self, session: AsyncSession, task_id: UUID, **kwargs
    ) -> Dict:
        """Update task fields."""
        task = await session.get(Task, task_id)
        if not task:
            return {"error": "Task not found"}

        for key, value in kwargs.items():
            if value is not None and hasattr(task, key):
                setattr(task, key, value)

        return {"id": str(task_id), "status": "updated"}

    async def update_status(
        self, session: AsyncSession, task_id: UUID,
        status: str, actual_minutes: int = None,
    ) -> Dict:
        """Update task status."""
        task = await session.get(Task, task_id)
        if not task:
            return {"error": "Task not found"}

        task.status = status
        if actual_minutes is not None:
            task.actual_minutes = actual_minutes
        if status == "done":
            task.completed_at = datetime.utcnow()

        return {"id": str(task_id), "status": status}

"""
AURORA API — Task Endpoints
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.dependencies import get_db
from app.database.schemas import TaskCreate, TaskUpdate, TaskStatusUpdate
from app.services.task_service import TaskService

router = APIRouter(prefix="/tasks", tags=["Tasks"])
service = TaskService()


@router.post("/")
async def create_task(data: TaskCreate, db: AsyncSession = Depends(get_db)):
    """Create a new task."""
    return await service.create_task(
        db, data.user_id, data.title, data.description,
        data.difficulty, data.estimated_minutes, data.priority,
        data.category, data.scheduled_start, data.scheduled_end,
    )


@router.get("/{user_id}")
async def get_tasks(
    user_id: UUID, status: str = None, category: str = None,
    db: AsyncSession = Depends(get_db),
):
    """List user tasks with optional filters."""
    return await service.get_tasks(db, user_id, status, category)


@router.put("/{task_id}")
async def update_task(
    task_id: UUID, data: TaskUpdate, db: AsyncSession = Depends(get_db)
):
    """Update task details."""
    return await service.update_task(db, task_id, **data.model_dump(exclude_unset=True))


@router.patch("/{task_id}/status")
async def update_task_status(
    task_id: UUID, data: TaskStatusUpdate, db: AsyncSession = Depends(get_db)
):
    """Update task status (pending/in_progress/done/missed)."""
    return await service.update_status(db, task_id, data.status, data.actual_minutes)

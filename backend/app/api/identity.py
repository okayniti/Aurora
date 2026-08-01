"""
AURORA API — Identity Endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.dependencies import get_db, get_current_user, require_path_user
from app.database.schemas import IdentityProfileUpdate, IdentityAlignRequest
from app.services.identity_service import IdentityService

from app.utils.limiter import limiter

router = APIRouter(prefix="/identity", tags=["Identity Alignment"])
service = IdentityService()


@router.post("/profile")
@limiter.limit("20/minute")
async def update_identity_profile(
    request: Request,
    data: IdentityProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Set or update user identity description."""
    return await service.update_identity(
        db, current_user.id, data.identity_desc, request.app.state.embedding_service
    )


@router.post("/align")
@limiter.limit("5/minute")
async def compute_alignment(
    request: Request,
    data: IdentityAlignRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Compute task-identity alignment score."""
    if data.task_id is not None:
        from app.database.models import Task

        task = await db.get(Task, data.task_id)
        if task is None:
            raise HTTPException(status_code=404, detail="Task not found")
        if task.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to access this resource")

    return await service.compute_alignment(
        db, current_user.id, data.task_id, data.task_description,
        request.app.state.embedding_service,
    )


@router.get("/scores/{user_id}")
async def get_all_scores(
    request: Request,
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
    _owner=Depends(require_path_user),
):
    """Get alignment scores for all user tasks."""
    return await service.get_all_scores(db, user_id, request.app.state.embedding_service)


@router.get("/profile/{user_id}")
async def get_identity_profile(
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
    _owner=Depends(require_path_user),
):
    """Get user identity description."""
    return await service.get_identity(db, user_id)

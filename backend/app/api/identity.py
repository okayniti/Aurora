"""
AURORA API — Identity Endpoints
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.dependencies import get_db
from app.database.schemas import IdentityProfileUpdate, IdentityAlignRequest
from app.services.identity_service import IdentityService

router = APIRouter(prefix="/identity", tags=["Identity Alignment"])
service = IdentityService()


@router.post("/profile")
async def update_identity_profile(
    data: IdentityProfileUpdate, db: AsyncSession = Depends(get_db)
):
    """Set or update user identity description."""
    return await service.update_identity(db, data.user_id, data.identity_desc)


@router.post("/align")
async def compute_alignment(
    data: IdentityAlignRequest, db: AsyncSession = Depends(get_db)
):
    """Compute task-identity alignment score."""
    return await service.compute_alignment(
        db, data.user_id, data.task_id, data.task_description
    )


@router.get("/scores/{user_id}")
async def get_all_scores(user_id: UUID, db: AsyncSession = Depends(get_db)):
    """Get alignment scores for all user tasks."""
    return await service.get_all_scores(db, user_id)

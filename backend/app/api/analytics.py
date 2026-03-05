"""
AURORA API — Analytics Endpoints
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from datetime import date

from app.dependencies import get_db
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Cognitive Analytics"])
service = AnalyticsService()


@router.get("/dashboard/{user_id}")
async def get_dashboard(user_id: UUID, db: AsyncSession = Depends(get_db)):
    """Get full cognitive analytics dashboard data."""
    return await service.get_dashboard(db, user_id)


@router.get("/daily/{user_id}")
async def get_daily_analytics(
    user_id: UUID, target_date: date = None, db: AsyncSession = Depends(get_db)
):
    """Get analytics for a specific day."""
    return await service.get_daily_analytics(db, user_id, target_date)

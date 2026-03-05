"""
AURORA API — Master Router
Aggregates all module routers into a single API router.
"""

from fastapi import APIRouter

from app.api.energy import router as energy_router
from app.api.burnout import router as burnout_router
from app.api.scheduler import router as scheduler_router
from app.api.identity import router as identity_router
from app.api.tasks import router as tasks_router
from app.api.replanning import router as replanning_router
from app.api.analytics import router as analytics_router

api_router = APIRouter(prefix="/api")

api_router.include_router(energy_router)
api_router.include_router(burnout_router)
api_router.include_router(scheduler_router)
api_router.include_router(identity_router)
api_router.include_router(tasks_router)
api_router.include_router(replanning_router)
api_router.include_router(analytics_router)

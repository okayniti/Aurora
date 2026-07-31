"""
AURORA API — Master Router
Aggregates all module routers into a single API router.

Every route mounted here requires a valid bearer token. Public routes
(/api/health, /api/auth/*) are mounted directly on the app in main.py.
"""

from fastapi import APIRouter, Depends

from app.dependencies import get_current_user

from app.api.energy import router as energy_router
from app.api.burnout import router as burnout_router
from app.api.scheduler import router as scheduler_router
from app.api.identity import router as identity_router
from app.api.tasks import router as tasks_router
from app.api.replanning import router as replanning_router
from app.api.analytics import router as analytics_router

from app.api.chat import router as chat_router

api_router = APIRouter(prefix="/api", dependencies=[Depends(get_current_user)])

api_router.include_router(energy_router)
api_router.include_router(burnout_router)
api_router.include_router(scheduler_router)
api_router.include_router(identity_router)
api_router.include_router(tasks_router)
api_router.include_router(replanning_router)
api_router.include_router(analytics_router)
api_router.include_router(chat_router)

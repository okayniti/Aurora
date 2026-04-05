"""
AURORA API — Chat Endpoints
"""

import os
from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, Request, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import logging

try:
    import google.generativeai as genai
except ImportError:
    genai = None

from app.dependencies import get_db
from app.utils.limiter import limiter
from app.services.energy_service import EnergyService
from app.services.burnout_service import BurnoutService
from app.services.task_service import TaskService
from app.database.models import User

logger = logging.getLogger("aurora.api.chat")

router = APIRouter(prefix="/chat", tags=["AI Chat"])

api_key = os.getenv("GEMINI_API_KEY")
if api_key and api_key != "your_gemini_api_key_here" and genai:
    genai.configure(api_key=api_key)


class ChatRequest(BaseModel):
    message: str
    userId: UUID


@router.post("/")
@limiter.limit("10/minute")
async def chat_with_aurora(request: Request, data: ChatRequest, db: AsyncSession = Depends(get_db)):
    """Talk to the Aurora AI assistant with active context."""
    energy_service = EnergyService()
    burnout_service = BurnoutService()
    task_service = TaskService()

    # 1. Fetch Energy
    energy_pct = 70
    try:
        energy_data = await energy_service.get_forecast(db, data.userId, request.app.state.energy_predictor)
        hr_preds = energy_data.get("hourly_predictions", [])
        current_hour = datetime.utcnow().hour
        if hr_preds and len(hr_preds) > current_hour:
            energy_val = hr_preds[current_hour].get("energy", 7.0)
        else:
            energy_val = 7.0
        energy_pct = int((energy_val / 10.0) * 100)
    except Exception as e:
        logger.warning(f"Error fetching energy context for chat: {e}")

    # 2. Fetch Burnout Risk
    burnout_pct = 0
    try:
        burnout_data = await burnout_service.get_risk(
            db, data.userId, request.app.state.burnout_predictor,
            7.0, 0, 0.3, 1.0, 5.0
        )
        burnout_pct = int(burnout_data.get("burnout_probability", 0.0) * 100)
    except Exception as e:
        logger.warning(f"Error fetching burnout context for chat: {e}")

    # 3. Fetch Active Tasks
    active_tasks = "None right now"
    try:
        tasks = await task_service.get_tasks(db, data.userId, status="in_progress")
        if not tasks:
            tasks = await task_service.get_tasks(db, data.userId, status="pending")
        if tasks:
            active_tasks = ", ".join([
                t.get("title", t.title) if isinstance(t, dict) else t.title
                for t in tasks[:3]
            ])
    except Exception as e:
        logger.warning(f"Error fetching task context for chat: {e}")

    # 4. Fetch Identity Profile
    identity = "General professional focusing on deep work."
    try:
        result = await db.execute(select(User).where(User.id == data.userId))
        user = result.scalar_one_or_none()
        if user and user.identity_desc:
            identity = user.identity_desc
    except Exception as e:
        logger.warning(f"Error fetching identity context for chat: {e}")

    # 5. Build Prompt
    system_prompt = f"""You are Aurora, an intelligent personal productivity assistant. You are warm, concise, and insightful.
Here is the current state of the user:
- Energy Level: {energy_pct}%
- Burnout Risk: {burnout_pct}%
- Active Tasks: {active_tasks}
- Identity Profile: {identity}

Respond in 2-3 sentences max. Be personal, actionable, and encouraging."""

    if not api_key or api_key == "your_gemini_api_key_here" or not genai:
        # Fallback offline simulation
        logger.info("Gemini API not configured, returning fallback response.")
        return {
            "response": f"I'm operating offline right now! Your energy is at {energy_pct}% and burnout risk is {burnout_pct}%. Let's focus on: {active_tasks}.",
            "timestamp": datetime.utcnow().isoformat()
        }

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        # Merge system prompt with user message since some models expect a single prompt via `generate_content`
        full_prompt = f"{system_prompt}\n\nUser message: {data.message}"
        
        result = model.generate_content(full_prompt)
        response_text = result.text.strip()
        
        return {
            "response": response_text,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Gemini API Error: {e}", exc_info=True)
        raise HTTPException(status_code=503, detail="Aurora is resting. Try again in a moment.")

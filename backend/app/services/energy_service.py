"""
AURORA Energy Service
Business logic layer connecting API → ML model → Database.
"""

from datetime import datetime, date, timedelta
from typing import Dict, List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
import logging

from app.database.models import EnergyLog, User
from app.ml.energy_model.inference import EnergyPredictor

logger = logging.getLogger("aurora.services.energy")


class EnergyService:
    def __init__(self):
        self.predictor = EnergyPredictor()

    async def get_forecast(
        self, session: AsyncSession, user_id: UUID
    ) -> Dict:
        """Get energy forecast for the current day."""
        # Fetch historical logs for LSTM input
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        query = select(EnergyLog).where(
            and_(
                EnergyLog.user_id == user_id,
                EnergyLog.timestamp >= seven_days_ago,
                EnergyLog.is_predicted == False,
            )
        ).order_by(EnergyLog.timestamp)

        result = await session.execute(query)
        logs = result.scalars().all()

        historical = [
            {
                "timestamp": log.timestamp,
                "energy_level": log.energy_level,
                "sleep_hours": log.sleep_hours or 7.0,
                "caffeine_intake": log.caffeine_intake or 0,
                "exercise_mins": log.exercise_mins or 0,
            }
            for log in logs
        ]

        # Get latest sleep/caffeine/exercise for heuristic fallback
        sleep = historical[-1]["sleep_hours"] if historical else 7.0
        caffeine = historical[-1]["caffeine_intake"] if historical else 0
        exercise = historical[-1]["exercise_mins"] if historical else 0

        forecast = self.predictor.predict(
            historical_logs=historical,
            sleep_hours=sleep,
            caffeine_intake=caffeine,
            exercise_mins=exercise,
        )

        forecast["user_id"] = str(user_id)
        forecast["forecast_date"] = date.today().isoformat()
        return forecast

    async def log_energy(
        self, session: AsyncSession, user_id: UUID,
        energy_level: float, sleep_hours: float = None,
        caffeine_intake: int = None, exercise_mins: int = None,
        timestamp: datetime = None,
    ) -> Dict:
        """Record an actual energy reading."""
        log = EnergyLog(
            user_id=user_id,
            timestamp=timestamp or datetime.utcnow(),
            energy_level=energy_level,
            is_predicted=False,
            sleep_hours=sleep_hours,
            caffeine_intake=caffeine_intake,
            exercise_mins=exercise_mins,
        )
        session.add(log)
        await session.flush()

        return {"id": str(log.id), "energy_level": energy_level, "status": "logged"}

    async def get_history(
        self, session: AsyncSession, user_id: UUID, days: int = 7
    ) -> List[Dict]:
        """Get historical energy data."""
        since = datetime.utcnow() - timedelta(days=days)
        query = select(EnergyLog).where(
            and_(EnergyLog.user_id == user_id, EnergyLog.timestamp >= since)
        ).order_by(EnergyLog.timestamp)

        result = await session.execute(query)
        logs = result.scalars().all()

        return [
            {
                "id": str(log.id),
                "timestamp": log.timestamp.isoformat(),
                "energy_level": log.energy_level,
                "is_predicted": log.is_predicted,
            }
            for log in logs
        ]

    async def get_comparison(
        self, session: AsyncSession, user_id: UUID, target_date: date = None
    ) -> Dict:
        """Get predicted vs actual energy comparison."""
        target_date = target_date or date.today()
        start = datetime.combine(target_date, datetime.min.time())
        end = start + timedelta(days=1)

        query = select(EnergyLog).where(
            and_(
                EnergyLog.user_id == user_id,
                EnergyLog.timestamp >= start,
                EnergyLog.timestamp < end,
            )
        ).order_by(EnergyLog.timestamp)

        result = await session.execute(query)
        logs = result.scalars().all()

        predicted = [l for l in logs if l.is_predicted]
        actual = [l for l in logs if not l.is_predicted]

        data_points = []
        for h in range(24):
            point = {"hour": h}
            pred_match = [p for p in predicted if p.timestamp.hour == h]
            actual_match = [a for a in actual if a.timestamp.hour == h]
            if pred_match:
                point["predicted"] = pred_match[0].energy_level
            if actual_match:
                point["actual"] = actual_match[0].energy_level
            data_points.append(point)

        return {"user_id": str(user_id), "date": target_date.isoformat(), "data_points": data_points}

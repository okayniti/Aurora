"""
AURORA Burnout Service
Business logic for burnout risk prediction and trend analysis.
"""

from datetime import datetime, timedelta
from typing import Dict, List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
import logging

from app.database.models import BurnoutSnapshot
from app.ml.burnout_model.inference import BurnoutPredictor

logger = logging.getLogger("aurora.services.burnout")


class BurnoutService:
    def __init__(self):
        self.predictor = BurnoutPredictor()

    async def get_risk(
        self, session: AsyncSession, user_id: UUID,
        sleep_trend: float = 7.0, deep_work_streak: int = 0,
        stress_trend: float = 0.3, energy_variance: float = 1.0,
        cognitive_load: float = 5.0,
    ) -> Dict:
        """Get current burnout risk prediction."""
        result = self.predictor.predict(
            sleep_trend=sleep_trend,
            deep_work_streak=deep_work_streak,
            stress_trend=stress_trend,
            energy_variance=energy_variance,
            cognitive_load=cognitive_load,
        )
        result["user_id"] = str(user_id)

        # Store snapshot
        snapshot = BurnoutSnapshot(
            user_id=user_id,
            timestamp=datetime.utcnow(),
            burnout_probability=result["burnout_probability"],
            sleep_trend=sleep_trend,
            deep_work_streak=deep_work_streak,
            stress_trend=stress_trend,
            energy_variance=energy_variance,
            cognitive_load=cognitive_load,
            feature_importance=result["feature_importance"],
        )
        session.add(snapshot)

        return result

    async def get_trend(
        self, session: AsyncSession, user_id: UUID, days: int = 30
    ) -> Dict:
        """Get burnout trend over past N days."""
        since = datetime.utcnow() - timedelta(days=days)
        query = select(BurnoutSnapshot).where(
            and_(BurnoutSnapshot.user_id == user_id, BurnoutSnapshot.timestamp >= since)
        ).order_by(BurnoutSnapshot.timestamp)

        result = await session.execute(query)
        snapshots = result.scalars().all()

        from app.ml.burnout_model.model import BurnoutClassifier

        data_points = [
            {
                "date": s.timestamp.isoformat(),
                "probability": s.burnout_probability,
                "risk_level": BurnoutClassifier.risk_level(s.burnout_probability),
            }
            for s in snapshots
        ]

        return {"user_id": str(user_id), "data_points": data_points}

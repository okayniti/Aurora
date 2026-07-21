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
import asyncio

from app.database.models import BurnoutSnapshot
from app.ml.burnout_model.inference import BurnoutPredictor

logger = logging.getLogger("aurora.services.burnout")


class BurnoutService:
    async def get_risk(
        self, session: AsyncSession, user_id: UUID, predictor: BurnoutPredictor,
        sleep_trend: float = None, deep_work_streak: int = None,
        stress_trend: float = None, energy_variance: float = None,
        cognitive_load: float = None,
    ) -> Dict:
        """Get current burnout risk prediction."""
        
        # If any parameter is None, try to fetch the latest database snapshot
        if (sleep_trend is None or deep_work_streak is None or 
            stress_trend is None or energy_variance is None or 
            cognitive_load is None):
            query = select(BurnoutSnapshot).where(
                BurnoutSnapshot.user_id == user_id
            ).order_by(BurnoutSnapshot.timestamp.desc()).limit(1)
            db_res = await session.execute(query)
            latest_snap = db_res.scalar_one_or_none()
            
            if latest_snap:
                if sleep_trend is None:
                    sleep_trend = latest_snap.sleep_trend
                if deep_work_streak is None:
                    deep_work_streak = latest_snap.deep_work_streak
                if stress_trend is None:
                    stress_trend = latest_snap.stress_trend
                if energy_variance is None:
                    energy_variance = latest_snap.energy_variance
                if cognitive_load is None:
                    cognitive_load = latest_snap.cognitive_load

        # Final default fallback if still None
        sleep_trend = 7.0 if sleep_trend is None else sleep_trend
        deep_work_streak = 0 if deep_work_streak is None else deep_work_streak
        stress_trend = 0.3 if stress_trend is None else stress_trend
        energy_variance = 1.0 if energy_variance is None else energy_variance
        cognitive_load = 5.0 if cognitive_load is None else cognitive_load

        # Yield to event loop before CPU-bound prediction
        await asyncio.sleep(0)
        
        result = predictor.predict(
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

    async def get_latest_snapshot(self, session: AsyncSession, user_id: UUID) -> Dict:
        """Return the latest raw burnout snapshot for UI initialization."""
        query = select(BurnoutSnapshot).where(
            BurnoutSnapshot.user_id == user_id
        ).order_by(BurnoutSnapshot.timestamp.desc()).limit(1)
        result = await session.execute(query)
        latest = result.scalar_one_or_none()
        if not latest:
            return {"user_id": str(user_id), "snapshot": None}

        return {
            "user_id": str(user_id),
            "snapshot": {
                "timestamp": latest.timestamp.isoformat(),
                "sleep_trend": latest.sleep_trend,
                "deep_work_streak": latest.deep_work_streak,
                "stress_trend": latest.stress_trend,
                "energy_variance": latest.energy_variance,
                "cognitive_load": latest.cognitive_load,
                "burnout_probability": latest.burnout_probability,
            },
        }

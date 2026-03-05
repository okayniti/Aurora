"""
AURORA Burnout Model — Inference Service
Production inference with explainability.
"""

import logging
from typing import Dict, Tuple
from datetime import datetime

from app.ml.burnout_model.model import BurnoutClassifier
from app.config import settings

logger = logging.getLogger("aurora.burnout.inference")


class BurnoutPredictor:
    """
    Burnout risk inference service.
    Automatically uses XGBoost if available, otherwise rule-based fallback.
    """

    def __init__(self, model_path: str = None):
        self.classifier = BurnoutClassifier()
        model_path = model_path or settings.BURNOUT_MODEL_PATH

        # Try to load trained model
        loaded = self.classifier.load_model(model_path)
        if not loaded:
            logger.info("No trained burnout model. Using rule-based fallback.")

    def predict(
        self,
        sleep_trend: float = 7.0,
        deep_work_streak: int = 0,
        stress_trend: float = 0.3,
        energy_variance: float = 1.0,
        cognitive_load: float = 5.0,
    ) -> Dict:
        """
        Predict burnout risk with explainability.

        Returns:
            Dict with probability, risk_level, feature_importance, model_type, timestamp
        """
        features = {
            "sleep_trend": sleep_trend,
            "deep_work_streak": deep_work_streak,
            "stress_trend": stress_trend,
            "energy_variance": energy_variance,
            "cognitive_load": cognitive_load,
        }

        probability, importance = self.classifier.predict(features)
        risk = BurnoutClassifier.risk_level(probability)
        model_type = "xgboost" if self.classifier.is_trained else "rule_based"

        result = {
            "burnout_probability": round(probability, 4),
            "risk_level": risk,
            "feature_importance": {k: round(v, 4) for k, v in importance.items()},
            "model_type": model_type,
            "timestamp": datetime.utcnow().isoformat(),
            "input_features": features,
        }

        logger.info(f"Burnout prediction: {probability:.3f} ({risk}) via {model_type}")
        return result

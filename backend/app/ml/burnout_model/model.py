"""
AURORA Burnout Risk Predictor — Model
Gradient-boosted classifier for burnout probability prediction.

Uses XGBoost for accuracy + SHAP for explainability.
Fallback: Rule-based risk scoring when model is untrained.
"""

import numpy as np
import logging
from typing import Dict, Optional, Tuple

logger = logging.getLogger("aurora.burnout.model")


class BurnoutClassifier:
    """
    XGBoost-based burnout risk classifier.

    Input features:
        - sleep_trend: 7-day average sleep hours (deviation from optimal)
        - deep_work_streak: consecutive hours of deep work
        - stress_trend: rolling stress score (0-1)
        - energy_variance: σ² of energy levels over past 7 days
        - cognitive_load: Σ(task_count × avg_difficulty)

    Output:
        - burnout_probability: float in [0, 1]
        - feature_importance: dict mapping feature names to importance scores
    """

    FEATURE_NAMES = [
        "sleep_trend",
        "deep_work_streak",
        "stress_trend",
        "energy_variance",
        "cognitive_load",
    ]

    def __init__(self):
        self.model = None
        self.is_trained = False

    def build_model(self):
        """Initialize XGBoost model with tuned hyperparameters."""
        try:
            import xgboost as xgb
            self.model = xgb.XGBClassifier(
                n_estimators=200,
                max_depth=5,
                learning_rate=0.05,
                subsample=0.8,
                colsample_bytree=0.8,
                min_child_weight=3,
                gamma=0.1,
                reg_alpha=0.1,
                reg_lambda=1.0,
                scale_pos_weight=2.0,  # Handle class imbalance
                eval_metric="logloss",
                use_label_encoder=False,
                random_state=42,
            )
            logger.info("XGBoost burnout classifier initialized")
        except ImportError:
            logger.warning("XGBoost not installed. Using rule-based fallback only.")
            self.model = None

    def load_model(self, path: str) -> bool:
        """Load a trained model from disk."""
        try:
            import xgboost as xgb
            import joblib
            self.model = joblib.load(path)
            self.is_trained = True
            logger.info(f"Burnout model loaded from {path}")
            return True
        except Exception as e:
            logger.error(f"Failed to load burnout model: {e}")
            self.is_trained = False
            return False

    def predict(self, features: Dict[str, float]) -> Tuple[float, Dict[str, float]]:
        """
        Predict burnout probability.

        Args:
            features: Dict with keys matching FEATURE_NAMES

        Returns:
            (burnout_probability, feature_importance_dict)
        """
        if self.is_trained and self.model is not None:
            return self._predict_xgboost(features)
        else:
            return self._predict_rule_based(features)

    def _predict_xgboost(self, features: Dict[str, float]) -> Tuple[float, Dict[str, float]]:
        """Predict using trained XGBoost model with SHAP explanations."""
        try:
            import shap
            X = np.array([[features.get(f, 0.0) for f in self.FEATURE_NAMES]])

            # Probability prediction
            proba = self.model.predict_proba(X)[0][1]

            # SHAP feature importance
            explainer = shap.TreeExplainer(self.model)
            shap_values = explainer.shap_values(X)

            if isinstance(shap_values, list):
                shap_vals = shap_values[1][0]  # Binary classification, positive class
            else:
                shap_vals = shap_values[0]

            feature_importance = {
                name: float(abs(val))
                for name, val in zip(self.FEATURE_NAMES, shap_vals)
            }

            # Normalize to sum to 1
            total = sum(feature_importance.values())
            if total > 0:
                feature_importance = {k: v / total for k, v in feature_importance.items()}

            return float(proba), feature_importance

        except Exception as e:
            logger.error(f"XGBoost prediction failed: {e}. Falling back to rule-based.")
            return self._predict_rule_based(features)

    def _predict_rule_based(self, features: Dict[str, float]) -> Tuple[float, Dict[str, float]]:
        """
        Rule-based burnout risk scoring.
        Provides immediate value before model training.

        Scoring rules:
        - Sleep: < 6h = high risk, 6-7h = moderate, > 7h = low
        - Deep work streak: > 4h = risk increases
        - Stress trend: direct contributor
        - Energy variance: high variance = instability risk
        - Cognitive load: overload threshold at > 15
        """
        sleep = features.get("sleep_trend", 7.0)
        deep_work = features.get("deep_work_streak", 0)
        stress = features.get("stress_trend", 0.3)
        energy_var = features.get("energy_variance", 1.0)
        cognitive_load = features.get("cognitive_load", 5.0)

        # Individual risk scores (0-1)
        sleep_risk = np.clip(1.0 - (sleep / 8.0), 0, 1)
        work_risk = np.clip(deep_work / 8.0, 0, 1)
        stress_risk = np.clip(stress, 0, 1)
        variance_risk = np.clip(energy_var / 5.0, 0, 1)
        load_risk = np.clip(cognitive_load / 20.0, 0, 1)

        # Weighted combination
        weights = {
            "sleep_trend": 0.25,
            "deep_work_streak": 0.15,
            "stress_trend": 0.30,
            "energy_variance": 0.10,
            "cognitive_load": 0.20,
        }

        risks = {
            "sleep_trend": sleep_risk,
            "deep_work_streak": work_risk,
            "stress_trend": stress_risk,
            "energy_variance": variance_risk,
            "cognitive_load": load_risk,
        }

        burnout_prob = sum(weights[k] * risks[k] for k in weights)
        burnout_prob = float(np.clip(burnout_prob, 0, 1))

        # Feature importance = normalized weighted contribution
        importance = {k: weights[k] * risks[k] for k in weights}
        total = sum(importance.values())
        if total > 0:
            importance = {k: v / total for k, v in importance.items()}

        return burnout_prob, importance

    @staticmethod
    def risk_level(probability: float) -> str:
        """Convert burnout probability to human-readable risk level."""
        if probability < 0.25:
            return "low"
        elif probability < 0.50:
            return "moderate"
        elif probability < 0.75:
            return "high"
        else:
            return "critical"

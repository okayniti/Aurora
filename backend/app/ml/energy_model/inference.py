"""
AURORA Energy Model — Inference Service
Loads trained model and generates energy forecasts.
"""

import torch
import numpy as np
import logging
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime, timedelta

from app.ml.energy_model.model import EnergyLSTM, HeuristicEnergyModel
from app.ml.energy_model.features import EnergyFeatureEngineer

logger = logging.getLogger("aurora.energy.inference")


class EnergyPredictor:
    """
    Inference service for energy level prediction.

    Automatically falls back to heuristic model if no trained LSTM
    checkpoint is available.
    """

    def __init__(self, model_path: str = "models/energy_model.pt"):
        self.model_path = model_path
        self.feature_engineer = EnergyFeatureEngineer()
        self.heuristic_model = HeuristicEnergyModel()
        self.lstm_model: Optional[EnergyLSTM] = None
        self.device = torch.device("cpu")
        self.model_loaded = False

        self._try_load_model()

    def _try_load_model(self):
        """Attempt to load trained LSTM model from checkpoint."""
        if not Path(self.model_path).exists():
            logger.info("No trained energy model found. Using heuristic fallback.")
            return

        try:
            checkpoint = torch.load(self.model_path, map_location=self.device)
            config = checkpoint.get("model_config", {})

            self.lstm_model = EnergyLSTM(
                input_dim=config.get("input_dim", 6),
                hidden_dim=config.get("hidden_dim", 128),
                num_layers=config.get("num_layers", 2),
                forecast_horizon=config.get("forecast_horizon", 24),
            )
            self.lstm_model.load_state_dict(checkpoint["model_state_dict"])
            self.lstm_model.to(self.device)
            self.lstm_model.eval()
            self.model_loaded = True

            logger.info(
                f"LSTM model loaded from {self.model_path} "
                f"(epoch {checkpoint.get('epoch', '?')}, "
                f"val_loss {checkpoint.get('val_loss', '?'):.6f})"
            )
        except Exception as e:
            logger.error(f"Failed to load energy model: {e}. Using heuristic fallback.")
            self.model_loaded = False

    def predict(
        self,
        historical_logs: Optional[List[Dict]] = None,
        sleep_hours: float = 7.0,
        caffeine_intake: int = 0,
        exercise_mins: int = 0,
    ) -> Dict:
        """
        Generate 24-hour energy forecast.

        Args:
            historical_logs: List of past energy log entries (for LSTM)
            sleep_hours: Last night's sleep (for heuristic)
            caffeine_intake: Caffeine count (for heuristic)
            exercise_mins: Exercise minutes (for heuristic)

        Returns:
            Dict with hourly predictions, model type, and confidence
        """
        if self.model_loaded and historical_logs and len(historical_logs) >= 48:
            return self._predict_lstm(historical_logs)
        else:
            return self._predict_heuristic(sleep_hours, caffeine_intake, exercise_mins)

    def _predict_lstm(self, historical_logs: List[Dict]) -> Dict:
        """Generate predictions using the trained LSTM model."""
        try:
            sequence = self.feature_engineer.build_sequence(historical_logs)
            x = torch.FloatTensor(sequence).unsqueeze(0).to(self.device)

            self.lstm_model.eval()
            with torch.no_grad():
                raw_preds = self.lstm_model(x)
                energy_preds = (raw_preds * 10.0).squeeze().cpu().numpy()

            now = datetime.utcnow()
            current_hour = now.hour

            hourly_predictions = []
            for i in range(24):
                hour = (current_hour + i) % 24
                hourly_predictions.append({
                    "hour": hour,
                    "energy": round(float(np.clip(energy_preds[i], 0, 10)), 1),
                    "timestamp": (now + timedelta(hours=i)).isoformat(),
                })

            return {
                "hourly_predictions": hourly_predictions,
                "model_type": "lstm",
                "confidence": 0.85,
            }
        except Exception as e:
            logger.error(f"LSTM prediction failed: {e}. Falling back to heuristic.")
            return self._predict_heuristic(7.0, 0, 0)

    def _predict_heuristic(
        self,
        sleep_hours: float,
        caffeine_intake: int,
        exercise_mins: int,
    ) -> Dict:
        """Generate predictions using the heuristic model."""
        predictions = self.heuristic_model.predict(sleep_hours, caffeine_intake, exercise_mins)
        now = datetime.utcnow()
        current_hour = now.hour

        hourly_predictions = []
        for i in range(24):
            hour = (current_hour + i) % 24
            hourly_predictions.append({
                "hour": hour,
                "energy": predictions[hour],
                "timestamp": (now + timedelta(hours=i)).isoformat(),
            })

        return {
            "hourly_predictions": hourly_predictions,
            "model_type": "heuristic",
            "confidence": 0.60,
        }

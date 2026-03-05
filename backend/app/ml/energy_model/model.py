"""
AURORA Energy Forecasting Model
LSTM-based time-series model for predicting hourly cognitive energy levels.

Architecture:
- Input: Sequence of past 168 hours (7 days) of behavioral features
- Output: Next 24 hours of predicted energy (0-10)
- Model: Multi-layer LSTM with dropout for regularization
"""

import torch
import torch.nn as nn
from typing import Optional


class EnergyLSTM(nn.Module):
    """
    LSTM model for energy level forecasting.

    Predicts the next `forecast_horizon` hours of energy levels (0-10)
    given a sequence of historical behavioral features.

    Architecture:
        Input (seq_len × input_dim) → LSTM layers → FC → Output (forecast_horizon)
    """

    def __init__(
        self,
        input_dim: int = 6,
        hidden_dim: int = 128,
        num_layers: int = 2,
        dropout: float = 0.2,
        forecast_horizon: int = 24,
    ):
        super().__init__()

        self.input_dim = input_dim
        self.hidden_dim = hidden_dim
        self.num_layers = num_layers
        self.forecast_horizon = forecast_horizon

        # LSTM encoder
        self.lstm = nn.LSTM(
            input_size=input_dim,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0.0,
        )

        # Layer normalization for stability
        self.layer_norm = nn.LayerNorm(hidden_dim)

        # Decoder: map LSTM output to energy predictions
        self.decoder = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_dim // 2, forecast_horizon),
            nn.Sigmoid(),  # Output in [0, 1], scale to [0, 10] in post-processing
        )

    def forward(
        self,
        x: torch.Tensor,
        hidden: Optional[tuple] = None,
    ) -> torch.Tensor:
        """
        Forward pass.

        Args:
            x: Input tensor of shape (batch_size, seq_len, input_dim)
            hidden: Optional initial hidden state

        Returns:
            predictions: Shape (batch_size, forecast_horizon) in [0, 1]
        """
        # LSTM forward
        lstm_out, _ = self.lstm(x, hidden)

        # Take the last time step output
        last_output = lstm_out[:, -1, :]  # (batch_size, hidden_dim)

        # Layer norm
        normalized = self.layer_norm(last_output)

        # Decode to predictions
        predictions = self.decoder(normalized)  # (batch_size, forecast_horizon)

        return predictions

    def predict_energy(self, x: torch.Tensor) -> torch.Tensor:
        """Predict energy levels scaled to 0-10 range."""
        self.eval()
        with torch.no_grad():
            raw_predictions = self.forward(x)
            return raw_predictions * 10.0  # Scale from [0,1] to [0,10]


class HeuristicEnergyModel:
    """
    Fallback heuristic model based on circadian rhythm and sleep quality.
    Used when insufficient training data is available for the LSTM.

    This provides immediate value while real data accumulates.
    """

    # Base circadian rhythm (average energy levels per hour)
    CIRCADIAN_BASE = [
        3.0, 2.5, 2.0, 1.5, 1.0, 1.5,  # 00:00 - 05:00 (sleep)
        3.0, 5.0, 7.0, 8.0, 8.5, 8.0,  # 06:00 - 11:00 (morning rise)
        7.0, 6.0, 5.5, 6.5, 7.0, 7.5,  # 12:00 - 17:00 (afternoon dip + recovery)
        7.0, 6.5, 6.0, 5.0, 4.0, 3.5,  # 18:00 - 23:00 (evening decline)
    ]

    def predict(
        self,
        sleep_hours: float = 7.0,
        caffeine_intake: int = 0,
        exercise_mins: int = 0,
    ) -> list:
        """
        Generate 24-hour energy forecast based on heuristics.

        Args:
            sleep_hours: Hours of sleep last night (affects baseline)
            caffeine_intake: Number of caffeinated drinks (delays afternoon dip)
            exercise_mins: Minutes of exercise (boosts mid-day energy)

        Returns:
            List of 24 hourly energy predictions (0-10)
        """
        predictions = list(self.CIRCADIAN_BASE)

        # Sleep modifier: deviation from 7.5h optimal
        sleep_modifier = (sleep_hours - 7.5) * 0.3
        predictions = [max(0, min(10, e + sleep_modifier)) for e in predictions]

        # Caffeine modifier: boost 2-6 hours after assumed intake at 8am
        if caffeine_intake > 0:
            caffeine_boost = min(caffeine_intake * 0.5, 2.0)
            for h in range(10, 14):  # 10:00 - 13:00
                predictions[h] = min(10, predictions[h] + caffeine_boost)
            # Caffeine crash
            for h in range(14, 17):
                predictions[h] = max(0, predictions[h] - caffeine_boost * 0.3)

        # Exercise modifier: boosts energy 1-4 hours after
        if exercise_mins > 0:
            exercise_boost = min(exercise_mins / 30 * 0.5, 1.5)
            for h in range(8, 12):  # Assuming morning exercise
                predictions[h] = min(10, predictions[h] + exercise_boost)

        return [round(e, 1) for e in predictions]

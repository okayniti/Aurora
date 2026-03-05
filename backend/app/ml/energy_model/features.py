"""
AURORA Energy Model — Feature Engineering
Transforms raw behavioral data into model-ready features.
"""

import numpy as np
from typing import List, Dict, Optional
from datetime import datetime


class EnergyFeatureEngineer:
    """
    Transforms raw behavioral logs into features for the LSTM model.

    Input features (per timestep):
        0. hour_of_day (cyclical encoded, sin)
        1. hour_of_day (cyclical encoded, cos)
        2. day_of_week (cyclical encoded, sin)
        3. sleep_hours_normalized
        4. caffeine_normalized
        5. exercise_normalized

    All features are normalized to [0, 1] or [-1, 1] for cyclical encodings.
    """

    SEQUENCE_LENGTH = 168  # 7 days = 168 hours

    def __init__(self):
        self.feature_names = [
            "hour_sin", "hour_cos", "dow_sin",
            "sleep_norm", "caffeine_norm", "exercise_norm",
        ]

    def cyclical_encode(self, value: float, max_val: float) -> tuple:
        """Encode a value cyclically using sin/cos."""
        sin_val = np.sin(2 * np.pi * value / max_val)
        cos_val = np.cos(2 * np.pi * value / max_val)
        return float(sin_val), float(cos_val)

    def normalize(self, value: float, min_val: float, max_val: float) -> float:
        """Min-max normalize a value to [0, 1]."""
        if max_val == min_val:
            return 0.5
        return float(np.clip((value - min_val) / (max_val - min_val), 0, 1))

    def extract_features(self, log_entry: Dict) -> List[float]:
        """
        Extract feature vector from a single energy log entry.

        Args:
            log_entry: Dict with keys: timestamp, sleep_hours, caffeine_intake, exercise_mins

        Returns:
            List of 6 float features
        """
        timestamp = log_entry.get("timestamp", datetime.utcnow())
        if isinstance(timestamp, str):
            timestamp = datetime.fromisoformat(timestamp)

        hour = timestamp.hour
        dow = timestamp.weekday()

        hour_sin, hour_cos = self.cyclical_encode(hour, 24)
        dow_sin, _ = self.cyclical_encode(dow, 7)

        sleep = self.normalize(log_entry.get("sleep_hours", 7.0), 0, 12)
        caffeine = self.normalize(log_entry.get("caffeine_intake", 0), 0, 10)
        exercise = self.normalize(log_entry.get("exercise_mins", 0), 0, 120)

        return [hour_sin, hour_cos, dow_sin, sleep, caffeine, exercise]

    def build_sequence(
        self,
        log_entries: List[Dict],
        pad_value: float = 0.0,
    ) -> np.ndarray:
        """
        Build a padded feature sequence from historical log entries.

        Args:
            log_entries: List of log dicts (oldest first)
            pad_value: Value to use for padding if < SEQUENCE_LENGTH entries

        Returns:
            np.ndarray of shape (SEQUENCE_LENGTH, num_features)
        """
        features = [self.extract_features(entry) for entry in log_entries]
        num_features = len(self.feature_names)

        # Pad or truncate to SEQUENCE_LENGTH
        if len(features) < self.SEQUENCE_LENGTH:
            pad_count = self.SEQUENCE_LENGTH - len(features)
            padding = [[pad_value] * num_features] * pad_count
            features = padding + features
        elif len(features) > self.SEQUENCE_LENGTH:
            features = features[-self.SEQUENCE_LENGTH:]

        return np.array(features, dtype=np.float32)

    def build_batch(
        self,
        sequences: List[List[Dict]],
    ) -> np.ndarray:
        """
        Build a batch of sequences for training.

        Args:
            sequences: List of List[log_entries], each of length <= SEQUENCE_LENGTH

        Returns:
            np.ndarray of shape (batch_size, SEQUENCE_LENGTH, num_features)
        """
        batch = [self.build_sequence(seq) for seq in sequences]
        return np.stack(batch, axis=0)

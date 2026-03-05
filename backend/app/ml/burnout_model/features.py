"""
AURORA Burnout Model — Feature Engineering
Computes burnout predictor features from raw behavioral data.
"""

import numpy as np
from typing import Dict, List, Optional
import logging

logger = logging.getLogger("aurora.burnout.features")


class BurnoutFeatureEngineer:
    """
    Computes the 5 burnout predictor features from raw data:
        1. sleep_trend: 7-day rolling average sleep hours
        2. deep_work_streak: consecutive deep work hours (current)
        3. stress_trend: exponential moving average of stress indicators
        4. energy_variance: variance of energy levels over past 7 days
        5. cognitive_load: Σ(active_tasks × avg_difficulty)
    """

    def compute_sleep_trend(
        self,
        sleep_entries: List[float],
        window: int = 7,
    ) -> float:
        """
        Compute rolling average sleep from the last `window` days.

        Args:
            sleep_entries: List of nightly sleep hours (most recent last)
            window: Number of days to average

        Returns:
            Average sleep hours (float)
        """
        if not sleep_entries:
            return 7.0  # Assume healthy default

        recent = sleep_entries[-window:]
        return float(np.mean(recent))

    def compute_deep_work_streak(
        self,
        activity_log: List[Dict],
    ) -> int:
        """
        Count consecutive deep work hours from the most recent entries.

        Args:
            activity_log: List of dicts with 'type' ('deep_work', 'break', etc.)
                          ordered chronologically

        Returns:
            Current streak of deep work hours
        """
        streak = 0
        for entry in reversed(activity_log):
            if entry.get("type") == "deep_work":
                streak += 1
            else:
                break
        return streak

    def compute_stress_trend(
        self,
        stress_scores: List[float],
        alpha: float = 0.3,
    ) -> float:
        """
        Compute exponential moving average of stress scores.

        Args:
            stress_scores: List of stress values (0-1), most recent last
            alpha: Smoothing factor [0, 1]. Higher = more weight on recent

        Returns:
            EMA stress trend (0-1)
        """
        if not stress_scores:
            return 0.3  # Low baseline

        ema = stress_scores[0]
        for score in stress_scores[1:]:
            ema = alpha * score + (1 - alpha) * ema

        return float(np.clip(ema, 0, 1))

    def compute_energy_variance(
        self,
        energy_levels: List[float],
        window: int = 168,  # 7 days in hours
    ) -> float:
        """
        Compute variance of energy levels over the time window.

        High variance indicates instability — a burnout precursor.

        Args:
            energy_levels: List of hourly energy readings
            window: Number of hours to consider

        Returns:
            Energy variance (float)
        """
        if len(energy_levels) < 2:
            return 1.0  # Neutral default

        recent = energy_levels[-window:]
        return float(np.var(recent))

    def compute_cognitive_load(
        self,
        tasks: List[Dict],
    ) -> float:
        """
        Compute cognitive load from active tasks.

        Formula: Σ(difficulty_i) for all active/pending tasks

        Args:
            tasks: List of task dicts with 'difficulty' and 'status'

        Returns:
            Cognitive load score (float)
        """
        active_tasks = [
            t for t in tasks
            if t.get("status") in ("pending", "in_progress")
        ]

        if not active_tasks:
            return 0.0

        total = sum(t.get("difficulty", 5.0) for t in active_tasks)
        return float(total)

    def compute_all_features(
        self,
        sleep_entries: List[float],
        activity_log: List[Dict],
        stress_scores: List[float],
        energy_levels: List[float],
        tasks: List[Dict],
    ) -> Dict[str, float]:
        """
        Compute all 5 burnout features.

        Returns:
            Dict with feature names as keys
        """
        return {
            "sleep_trend": self.compute_sleep_trend(sleep_entries),
            "deep_work_streak": self.compute_deep_work_streak(activity_log),
            "stress_trend": self.compute_stress_trend(stress_scores),
            "energy_variance": self.compute_energy_variance(energy_levels),
            "cognitive_load": self.compute_cognitive_load(tasks),
        }

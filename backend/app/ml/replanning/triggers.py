"""
AURORA Replanning — Trigger Detection
Detects conditions that warrant automatic schedule replanning.
"""

import numpy as np
import logging
from typing import Dict, Optional, List
from datetime import datetime

from app.config import settings

logger = logging.getLogger("aurora.replanning.triggers")


class ReplanTriggerDetector:
    """
    Monitors for conditions that should trigger automatic replanning:
        1. Missed task — a scheduled task was not completed
        2. Energy deviation — actual energy deviates > 2σ from forecast
        3. Stress spike — burnout probability exceeds threshold
    """

    def __init__(
        self,
        energy_deviation_threshold: float = None,
        stress_spike_threshold: float = None,
    ):
        self.energy_deviation_threshold = (
            energy_deviation_threshold or settings.ENERGY_DEVIATION_THRESHOLD
        )
        self.stress_spike_threshold = (
            stress_spike_threshold or settings.STRESS_SPIKE_THRESHOLD
        )

    def check_missed_task(
        self,
        task_id: str,
        scheduled_end: datetime,
        current_time: datetime,
        status: str,
    ) -> Optional[Dict]:
        """
        Check if a task was missed (scheduled time passed, not completed).

        Returns:
            Trigger dict if missed, None otherwise
        """
        if status in ("pending", "in_progress") and current_time > scheduled_end:
            trigger = {
                "trigger_type": "missed_task",
                "trigger_data": {
                    "task_id": task_id,
                    "scheduled_end": scheduled_end.isoformat(),
                    "detected_at": current_time.isoformat(),
                },
                "severity": "high",
            }
            logger.warning(f"Missed task detected: {task_id}")
            return trigger

        return None

    def check_energy_deviation(
        self,
        predicted_energy: float,
        actual_energy: float,
        historical_variance: float = 1.0,
    ) -> Optional[Dict]:
        """
        Check if actual energy deviates significantly from prediction.

        Uses z-score approach: |actual - predicted| > threshold × σ

        Returns:
            Trigger dict if significant deviation, None otherwise
        """
        std_dev = max(np.sqrt(historical_variance), 0.5)
        deviation = abs(actual_energy - predicted_energy)
        z_score = deviation / std_dev

        if z_score > self.energy_deviation_threshold:
            direction = "below" if actual_energy < predicted_energy else "above"
            trigger = {
                "trigger_type": "energy_deviation",
                "trigger_data": {
                    "predicted": predicted_energy,
                    "actual": actual_energy,
                    "z_score": round(z_score, 2),
                    "direction": direction,
                    "detected_at": datetime.utcnow().isoformat(),
                },
                "severity": "high" if z_score > 3.0 else "moderate",
            }
            logger.warning(
                f"Energy deviation: predicted={predicted_energy}, "
                f"actual={actual_energy}, z={z_score:.2f}"
            )
            return trigger

        return None

    def check_stress_spike(
        self,
        burnout_probability: float,
        previous_probability: float = 0.3,
    ) -> Optional[Dict]:
        """
        Check if burnout probability spiked above threshold.

        Returns:
            Trigger dict if stress spike detected, None otherwise
        """
        if burnout_probability > self.stress_spike_threshold:
            spike_delta = burnout_probability - previous_probability
            trigger = {
                "trigger_type": "stress_spike",
                "trigger_data": {
                    "current_probability": round(burnout_probability, 3),
                    "previous_probability": round(previous_probability, 3),
                    "spike_delta": round(spike_delta, 3),
                    "detected_at": datetime.utcnow().isoformat(),
                },
                "severity": "critical" if burnout_probability > 0.9 else "high",
            }
            logger.warning(
                f"Stress spike: burnout_prob={burnout_probability:.3f} "
                f"(threshold={self.stress_spike_threshold})"
            )
            return trigger

        return None

    def evaluate_all(
        self,
        tasks: List[Dict],
        energy_predicted: float,
        energy_actual: float,
        burnout_prob: float,
        burnout_prev: float = 0.3,
        energy_variance: float = 1.0,
        current_time: Optional[datetime] = None,
    ) -> List[Dict]:
        """
        Run all trigger checks and return list of active triggers.
        """
        current_time = current_time or datetime.utcnow()
        triggers = []

        # Check missed tasks
        for task in tasks:
            if task.get("scheduled_end"):
                scheduled_end = task["scheduled_end"]
                if isinstance(scheduled_end, str):
                    scheduled_end = datetime.fromisoformat(scheduled_end)

                result = self.check_missed_task(
                    task.get("id", "unknown"),
                    scheduled_end,
                    current_time,
                    task.get("status", "pending"),
                )
                if result:
                    triggers.append(result)

        # Check energy deviation
        energy_trigger = self.check_energy_deviation(
            energy_predicted, energy_actual, energy_variance
        )
        if energy_trigger:
            triggers.append(energy_trigger)

        # Check stress spike
        stress_trigger = self.check_stress_spike(burnout_prob, burnout_prev)
        if stress_trigger:
            triggers.append(stress_trigger)

        return triggers

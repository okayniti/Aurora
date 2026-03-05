"""
AURORA RL Scheduler — Reward Function Design
Modular reward function for the task scheduling RL agent.
"""

import numpy as np
from typing import Dict
import logging

logger = logging.getLogger("aurora.rl.reward")


class RewardFunction:
    """
    Configurable reward function for the scheduling agent.

    Components:
        + completion_reward: task completed given energy >= threshold
        + alignment_bonus: task aligns with user identity
        + priority_bonus: high-priority task scheduled appropriately
        - burnout_penalty: burnout risk exceeds threshold
        - overload_penalty: high difficulty + low energy mismatch
        - time_waste_penalty: idle periods with low burnout risk
    """

    def __init__(
        self,
        completion_weight: float = 1.0,
        alignment_weight: float = 0.5,
        priority_weight: float = 0.3,
        burnout_weight: float = 1.5,
        overload_weight: float = 1.0,
    ):
        self.completion_weight = completion_weight
        self.alignment_weight = alignment_weight
        self.priority_weight = priority_weight
        self.burnout_weight = burnout_weight
        self.overload_weight = overload_weight

    def compute(
        self,
        energy: float,
        task_difficulty: float,
        burnout_prob: float,
        identity_alignment: float = 0.5,
        priority: int = 3,
        is_break: bool = False,
    ) -> Dict[str, float]:
        """
        Compute the composite reward for a scheduling action.

        Args:
            energy: Current energy level (0-10)
            task_difficulty: Difficulty of scheduled task (0-10)
            burnout_prob: Current burnout probability (0-1)
            identity_alignment: Task-identity alignment score (0-1)
            priority: Task priority (1-5)
            is_break: Whether the action is a break

        Returns:
            Dict with total reward and component breakdown
        """
        if is_break:
            return self._compute_break_reward(burnout_prob)

        # Completion reward (energy sufficiency)
        energy_ratio = energy / max(task_difficulty, 1.0)
        completion = self.completion_weight * (1.0 if energy_ratio > 0.6 else 0.3)

        # Identity alignment bonus
        alignment = self.alignment_weight * identity_alignment

        # Priority bonus
        priority_norm = priority / 5.0
        priority_bonus = self.priority_weight * priority_norm

        # Burnout penalty (exponential above threshold)
        burnout_penalty = 0.0
        if burnout_prob > 0.5:
            burnout_penalty = -self.burnout_weight * (burnout_prob - 0.5) ** 2 * 4

        # Overload penalty
        overload = 0.0
        if task_difficulty > 7.0 and energy < 4.0:
            overload = -self.overload_weight * (1.0 - energy / 10.0)

        total = completion + alignment + priority_bonus + burnout_penalty + overload

        return {
            "total": float(total),
            "completion": float(completion),
            "alignment": float(alignment),
            "priority": float(priority_bonus),
            "burnout_penalty": float(burnout_penalty),
            "overload_penalty": float(overload),
        }

    def _compute_break_reward(self, burnout_prob: float) -> Dict[str, float]:
        """Reward/penalty for taking a break."""
        if burnout_prob > 0.6:
            reward = 0.4  # Good to rest when stressed
        elif burnout_prob > 0.4:
            reward = 0.1  # Marginal benefit
        else:
            reward = -0.2  # Wasting time when not needed

        return {
            "total": float(reward),
            "break_reward": float(reward),
        }

"""
AURORA RL Scheduler — Gym-compatible Environment
Custom environment for task scheduling optimization.

The RL agent learns to select the optimal next task to schedule
given the current cognitive state (energy, burnout risk, time remaining).
"""

import numpy as np
from typing import List, Dict, Tuple, Optional
import logging

logger = logging.getLogger("aurora.rl.environment")


class TaskSchedulingEnv:
    """
    Custom Gym-compatible environment for task scheduling.

    State space (continuous, normalized to [0, 1]):
        - current_energy: predicted energy level at current time
        - burnout_probability: current burnout risk
        - time_remaining: fraction of day remaining
        - tasks_remaining: fraction of tasks still unscheduled
        - avg_task_difficulty: average difficulty of remaining tasks
        - cognitive_load: current cumulative cognitive load

    Action space (discrete):
        - Select task index from remaining task pool (0 to max_tasks-1)
        - Action max_tasks = "take a break" (no task)

    Reward:
        + task_completion_reward (if energy > difficulty * 0.5)
        + identity_alignment_bonus
        - burnout_penalty (if burnout_prob > threshold)
        - overload_penalty (if scheduling high-difficulty during low energy)
    """

    STATE_DIM = 6
    MAX_TASKS = 20  # Maximum tasks per day

    def __init__(
        self,
        tasks: Optional[List[Dict]] = None,
        energy_forecast: Optional[List[float]] = None,
        burnout_probability: float = 0.3,
    ):
        self.initial_tasks = tasks or []
        self.energy_forecast = energy_forecast or [7.0] * 24
        self.initial_burnout = burnout_probability

        # Internal state
        self.remaining_tasks: List[Dict] = []
        self.scheduled_tasks: List[Dict] = []
        self.current_hour: int = 8  # Start at 8 AM
        self.end_hour: int = 22     # End at 10 PM
        self.burnout_prob: float = 0.3
        self.cumulative_load: float = 0.0
        self.done: bool = False
        self.step_count: int = 0

        self.action_space_n = self.MAX_TASKS + 1  # +1 for "break" action

    def reset(
        self,
        tasks: Optional[List[Dict]] = None,
        energy_forecast: Optional[List[float]] = None,
        burnout_probability: Optional[float] = None,
    ) -> np.ndarray:
        """Reset environment for a new episode."""
        self.remaining_tasks = list(tasks or self.initial_tasks)
        self.energy_forecast = energy_forecast or self.energy_forecast
        self.burnout_prob = burnout_probability if burnout_probability is not None else self.initial_burnout
        self.scheduled_tasks = []
        self.current_hour = 8
        self.cumulative_load = 0.0
        self.done = False
        self.step_count = 0

        return self._get_state()

    def step(self, action: int) -> Tuple[np.ndarray, float, bool, Dict]:
        """
        Execute one scheduling step.

        Args:
            action: Task index to schedule, or MAX_TASKS for "take break"

        Returns:
            (next_state, reward, done, info)
        """
        info = {"action_type": "schedule"}
        reward = 0.0

        if self.done:
            return self._get_state(), 0.0, True, {"action_type": "done"}

        # Break action
        if action >= len(self.remaining_tasks) or action == self.MAX_TASKS:
            reward = self._take_break()
            info["action_type"] = "break"
        else:
            # Schedule the selected task
            task = self.remaining_tasks[action]
            reward = self._schedule_task(task)
            self.remaining_tasks.pop(action)
            self.scheduled_tasks.append(task)
            info["task_title"] = task.get("title", "Unknown")
            info["action_type"] = "schedule"

        # Advance time
        self.current_hour += 1
        self.step_count += 1

        # Check termination
        if self.current_hour >= self.end_hour or len(self.remaining_tasks) == 0:
            self.done = True

        next_state = self._get_state()
        return next_state, reward, self.done, info

    def _get_state(self) -> np.ndarray:
        """Construct the normalized state vector."""
        current_energy = self.energy_forecast[min(self.current_hour, 23)] / 10.0
        time_remaining = (self.end_hour - self.current_hour) / (self.end_hour - 8)
        tasks_remaining = len(self.remaining_tasks) / max(self.MAX_TASKS, 1)

        avg_difficulty = 0.0
        if self.remaining_tasks:
            avg_difficulty = np.mean([t.get("difficulty", 5.0) for t in self.remaining_tasks]) / 10.0

        cognitive_load_norm = min(self.cumulative_load / 50.0, 1.0)

        state = np.array([
            np.clip(current_energy, 0, 1),
            np.clip(self.burnout_prob, 0, 1),
            np.clip(time_remaining, 0, 1),
            np.clip(tasks_remaining, 0, 1),
            np.clip(avg_difficulty, 0, 1),
            np.clip(cognitive_load_norm, 0, 1),
        ], dtype=np.float32)

        return state

    def _schedule_task(self, task: Dict) -> float:
        """Calculate reward for scheduling a specific task at current time."""
        energy = self.energy_forecast[min(self.current_hour, 23)]
        difficulty = task.get("difficulty", 5.0)
        alignment = task.get("identity_alignment", 0.5)
        priority = task.get("priority", 3) / 5.0

        # Base completion reward (higher when energy matches difficulty)
        energy_match = energy / 10.0 - difficulty / 10.0
        completion_reward = 1.0 if energy_match > -0.2 else 0.3

        # Identity alignment bonus
        alignment_bonus = 0.5 * alignment

        # Priority bonus
        priority_bonus = 0.3 * priority

        # Burnout penalty
        burnout_penalty = -1.5 * max(0, self.burnout_prob - 0.5)

        # Overload penalty (high difficulty + low energy)
        overload_penalty = 0.0
        if difficulty > 7.0 and energy < 4.0:
            overload_penalty = -1.0

        # Update cumulative load
        self.cumulative_load += difficulty

        # Update burnout probability
        self.burnout_prob = min(1.0, self.burnout_prob + difficulty * 0.02)

        total_reward = completion_reward + alignment_bonus + priority_bonus + burnout_penalty + overload_penalty
        return float(total_reward)

    def _take_break(self) -> float:
        """Calculate reward for taking a break."""
        # Small positive reward if burnout risk is high
        if self.burnout_prob > 0.5:
            self.burnout_prob = max(0, self.burnout_prob - 0.1)
            return 0.3  # Good to take a break when stressed

        # Small negative reward if burnout risk is low (wasting time)
        return -0.1

    def get_valid_actions(self) -> List[int]:
        """Return list of valid action indices."""
        valid = list(range(len(self.remaining_tasks)))
        valid.append(self.MAX_TASKS)  # Break is always valid
        return valid

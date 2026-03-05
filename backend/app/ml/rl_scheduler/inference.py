"""
AURORA RL Scheduler — Inference Service
Generates optimized schedules using trained DQN agent or greedy fallback.
"""

import logging
from typing import Dict, List, Optional
from datetime import datetime, timedelta

from app.ml.rl_scheduler.agent import DQNAgent, GreedyScheduler
from app.ml.rl_scheduler.environment import TaskSchedulingEnv
from app.config import settings

logger = logging.getLogger("aurora.rl.inference")


class ScheduleOptimizer:
    """
    Schedule optimization service.
    Uses trained DQN agent if available, otherwise greedy fallback.
    """

    def __init__(self, model_path: str = None):
        self.agent = DQNAgent()
        self.env = TaskSchedulingEnv()
        self.greedy = GreedyScheduler()
        self.agent_loaded = False

        model_path = model_path or settings.RL_MODEL_PATH
        if self.agent.load(model_path):
            self.agent_loaded = True

    def optimize(
        self,
        tasks: List[Dict],
        energy_forecast: List[float],
        burnout_probability: float = 0.3,
        start_hour: int = 8,
        end_hour: int = 22,
    ) -> Dict:
        """
        Generate an optimized daily schedule.

        Args:
            tasks: List of task dicts to schedule
            energy_forecast: 24-hour energy prediction
            burnout_probability: Current burnout risk
            start_hour: Day start
            end_hour: Day end

        Returns:
            Dict with schedule entries, strategy type, and confidence
        """
        if not tasks:
            return {"entries": [], "strategy": "none", "total_confidence": 0.0}

        if self.agent_loaded:
            return self._optimize_rl(tasks, energy_forecast, burnout_probability)
        else:
            return self._optimize_greedy(tasks, energy_forecast, start_hour, end_hour)

    def _optimize_rl(
        self,
        tasks: List[Dict],
        energy_forecast: List[float],
        burnout_probability: float,
    ) -> Dict:
        """Generate schedule using the trained DQN agent."""
        state = self.env.reset(tasks, energy_forecast, burnout_probability)
        schedule_entries = []

        while not self.env.done:
            valid_actions = self.env.get_valid_actions()
            action = self.agent.select_action(state, valid_actions, training=False)

            prev_hour = self.env.current_hour
            state, reward, done, info = self.env.step(action)

            if info.get("action_type") == "schedule":
                task = self.env.scheduled_tasks[-1] if self.env.scheduled_tasks else {}
                est_hours = max(1, (task.get("estimated_minutes", 60) + 30) // 60)

                schedule_entries.append({
                    "task_id": task.get("id"),
                    "task_title": task.get("title", "Unknown"),
                    "time_slot_start_hour": prev_hour,
                    "time_slot_end_hour": min(prev_hour + est_hours, 22),
                    "confidence": round(0.7 + reward * 0.1, 2),
                    "predicted_energy": energy_forecast[min(prev_hour, 23)],
                })

        avg_confidence = sum(e.get("confidence", 0.5) for e in schedule_entries) / max(len(schedule_entries), 1)

        return {
            "entries": schedule_entries,
            "strategy": "rl_dqn",
            "total_confidence": round(avg_confidence, 2),
        }

    def _optimize_greedy(
        self,
        tasks: List[Dict],
        energy_forecast: List[float],
        start_hour: int,
        end_hour: int,
    ) -> Dict:
        """Generate schedule using the greedy fallback."""
        entries = self.greedy.schedule(tasks, energy_forecast, start_hour, end_hour)

        return {
            "entries": entries,
            "strategy": "greedy",
            "total_confidence": 0.5,
        }

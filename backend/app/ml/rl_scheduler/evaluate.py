"""
AURORA RL Scheduler — Evaluation
Metrics for RL strategy efficiency.
"""

import numpy as np
import logging
from typing import Dict, List

from app.utils.metrics import calculate_rl_metrics

logger = logging.getLogger("aurora.rl.evaluate")


def evaluate_schedule_quality(
    scheduled_tasks: List[Dict],
    completed_tasks: List[str],
    burnout_events: int = 0,
    total_tasks: int = 0,
) -> Dict[str, float]:
    """
    Evaluate the quality of a generated schedule.

    Args:
        scheduled_tasks: List of scheduled task entries
        completed_tasks: List of task IDs that were completed
        burnout_events: Number of burnout-triggered replans
        total_tasks: Total tasks that needed scheduling

    Returns:
        Dict with schedule quality metrics
    """
    if not scheduled_tasks:
        return {"completion_rate": 0.0, "schedule_adherence": 0.0, "burnout_avoidance": 1.0}

    scheduled_ids = {t.get("task_id") for t in scheduled_tasks}
    completed_scheduled = len(scheduled_ids.intersection(set(completed_tasks)))

    completion_rate = completed_scheduled / max(len(scheduled_tasks), 1)
    schedule_adherence = len(scheduled_tasks) / max(total_tasks, 1)
    burnout_avoidance = 1.0 - (burnout_events / max(len(scheduled_tasks), 1))

    metrics = {
        "completion_rate": float(completion_rate),
        "schedule_adherence": float(np.clip(schedule_adherence, 0, 1)),
        "burnout_avoidance": float(np.clip(burnout_avoidance, 0, 1)),
        "tasks_scheduled": len(scheduled_tasks),
        "tasks_completed": completed_scheduled,
    }

    logger.info(f"Schedule quality: {metrics}")
    return metrics

"""
AURORA Replanning — Priority Protection
Logic for protecting high-priority tasks during rescheduling.
"""

import logging
from typing import Dict, List

logger = logging.getLogger("aurora.replanning.priority")


class PriorityProtector:
    """
    Ensures high-priority tasks are preserved during replanning.

    Rules:
    - Priority 5 (critical): Never defer, always reschedule
    - Priority 4 (high): Defer only if burnout > 0.8
    - Priority 3 (medium): Deferrable but attempt to keep
    - Priority 1-2 (low): First candidates for deferral
    """

    PROTECTION_RULES = {
        5: {"defer_threshold": 1.0, "label": "critical"},  # Never defer
        4: {"defer_threshold": 0.8, "label": "high"},
        3: {"defer_threshold": 0.5, "label": "medium"},
        2: {"defer_threshold": 0.3, "label": "low"},
        1: {"defer_threshold": 0.1, "label": "minimal"},
    }

    def should_protect(self, task: Dict, burnout_prob: float) -> bool:
        """
        Determine if a task should be protected from deferral.

        Args:
            task: Task dict with 'priority'
            burnout_prob: Current burnout probability

        Returns:
            True if task should be protected (not deferred)
        """
        priority = task.get("priority", 3)
        rule = self.PROTECTION_RULES.get(priority, self.PROTECTION_RULES[3])

        return burnout_prob < rule["defer_threshold"]

    def partition_tasks(
        self, tasks: List[Dict], burnout_prob: float
    ) -> tuple:
        """
        Partition tasks into protected and deferrable based on burnout state.

        Returns:
            (protected_tasks, deferrable_tasks)
        """
        protected = []
        deferrable = []

        for task in tasks:
            if self.should_protect(task, burnout_prob):
                protected.append(task)
            else:
                deferrable.append(task)

        logger.info(
            f"Priority partition: {len(protected)} protected, "
            f"{len(deferrable)} deferrable (burnout={burnout_prob:.2f})"
        )

        return protected, deferrable

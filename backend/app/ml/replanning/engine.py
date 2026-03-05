"""
AURORA Replanning — Engine
Automatically reschedules the day when triggers fire.
"""

import logging
from typing import Dict, List, Optional

logger = logging.getLogger("aurora.replanning.engine")


class ReplanEngine:
    """
    Rescheduling engine that rebuilds the daily schedule when
    deviation triggers are detected.

    Priorities:
    - Protect high-priority tasks (priority >= 4)
    - Defer low-priority tasks if energy is depleted
    - Use updated energy forecasts for rescheduling
    """

    def replan(
        self,
        current_schedule: List[Dict],
        remaining_tasks: List[Dict],
        trigger: Dict,
        energy_forecast: List[float],
        burnout_probability: float,
        current_hour: int,
    ) -> Dict:
        """
        Generate a replanned schedule based on the trigger.

        Args:
            current_schedule: Existing schedule entries
            remaining_tasks: Tasks not yet completed
            trigger: The trigger that fired
            energy_forecast: Updated energy forecast
            burnout_probability: Current burnout probability
            current_hour: Current hour of day

        Returns:
            Dict with new_schedule, deferred_tasks, and replan_summary
        """
        trigger_type = trigger.get("trigger_type", "manual")

        # Separate protected vs deferrable tasks
        protected, deferrable = self._partition_by_priority(remaining_tasks)

        # Apply trigger-specific strategy
        if trigger_type == "stress_spike":
            return self._replan_for_stress(
                protected, deferrable, energy_forecast, burnout_probability, current_hour
            )
        elif trigger_type == "energy_deviation":
            return self._replan_for_energy(
                protected, deferrable, energy_forecast, trigger, current_hour
            )
        elif trigger_type == "missed_task":
            return self._replan_for_missed(
                protected, deferrable, energy_forecast, trigger, current_hour
            )
        else:
            return self._replan_default(
                protected, deferrable, energy_forecast, current_hour
            )

    def _partition_by_priority(
        self, tasks: List[Dict]
    ) -> tuple:
        """Split tasks into protected (priority >= 4) and deferrable."""
        protected = [t for t in tasks if t.get("priority", 3) >= 4]
        deferrable = [t for t in tasks if t.get("priority", 3) < 4]
        return protected, deferrable

    def _replan_for_stress(
        self,
        protected: List[Dict],
        deferrable: List[Dict],
        energy_forecast: List[float],
        burnout_prob: float,
        current_hour: int,
    ) -> Dict:
        """Replan when stress spike: add breaks, defer non-essential tasks."""
        new_schedule = []
        deferred = []
        hour = current_hour

        # Insert immediate rest break
        new_schedule.append({
            "type": "break",
            "start_hour": hour,
            "end_hour": hour + 1,
            "reason": "stress_recovery",
        })
        hour += 1

        # Schedule only protected tasks with breaks between
        for task in protected:
            if hour >= 22:
                deferred.append(task)
                continue

            est_hours = max(1, (task.get("estimated_minutes", 60) + 30) // 60)
            new_schedule.append({
                "task_id": task.get("id"),
                "task_title": task.get("title"),
                "start_hour": hour,
                "end_hour": min(hour + est_hours, 22),
            })
            hour += est_hours

            # Insert recovery break if burnout is high
            if burnout_prob > 0.6 and hour < 21:
                new_schedule.append({
                    "type": "break",
                    "start_hour": hour,
                    "end_hour": hour + 1,
                    "reason": "burnout_prevention",
                })
                hour += 1

        # Defer all non-protected
        deferred.extend(deferrable)

        return {
            "new_schedule": new_schedule,
            "deferred_tasks": deferred,
            "tasks_affected": len(deferred),
            "strategy": "stress_recovery",
            "summary": f"Deferred {len(deferred)} tasks. Added recovery breaks. "
                       f"Protected {len(protected)} high-priority tasks.",
        }

    def _replan_for_energy(
        self,
        protected: List[Dict],
        deferrable: List[Dict],
        energy_forecast: List[float],
        trigger: Dict,
        current_hour: int,
    ) -> Dict:
        """Replan when energy deviates: reorder by energy matching."""
        all_tasks = protected + deferrable
        direction = trigger.get("trigger_data", {}).get("direction", "below")

        if direction == "below":
            # Energy lower than expected: sort easiest first
            all_tasks.sort(key=lambda t: t.get("difficulty", 5.0))
        else:
            # Energy higher than expected: front-load hard tasks
            all_tasks.sort(key=lambda t: t.get("difficulty", 5.0), reverse=True)

        new_schedule = []
        hour = current_hour
        deferred = []

        for task in all_tasks:
            if hour >= 22:
                deferred.append(task)
                continue

            est_hours = max(1, (task.get("estimated_minutes", 60) + 30) // 60)
            new_schedule.append({
                "task_id": task.get("id"),
                "task_title": task.get("title"),
                "start_hour": hour,
                "end_hour": min(hour + est_hours, 22),
            })
            hour += est_hours

        return {
            "new_schedule": new_schedule,
            "deferred_tasks": deferred,
            "tasks_affected": len(all_tasks),
            "strategy": "energy_reorder",
            "summary": f"Reordered {len(new_schedule)} tasks by {'ascending' if direction == 'below' else 'descending'} difficulty.",
        }

    def _replan_for_missed(
        self,
        protected: List[Dict],
        deferrable: List[Dict],
        energy_forecast: List[float],
        trigger: Dict,
        current_hour: int,
    ) -> Dict:
        """Replan when a task was missed: reschedule remaining."""
        all_tasks = protected + deferrable
        # Prioritize by priority then by difficulty matching to energy
        all_tasks.sort(key=lambda t: (-t.get("priority", 3), t.get("difficulty", 5.0)))

        new_schedule = []
        deferred = []
        hour = current_hour

        for task in all_tasks:
            if hour >= 22:
                deferred.append(task)
                continue

            est_hours = max(1, (task.get("estimated_minutes", 60) + 30) // 60)
            new_schedule.append({
                "task_id": task.get("id"),
                "task_title": task.get("title"),
                "start_hour": hour,
                "end_hour": min(hour + est_hours, 22),
            })
            hour += est_hours

        missed_id = trigger.get("trigger_data", {}).get("task_id", "unknown")

        return {
            "new_schedule": new_schedule,
            "deferred_tasks": deferred,
            "tasks_affected": len(all_tasks),
            "strategy": "missed_task_recovery",
            "summary": f"Recovered from missed task {missed_id}. Rescheduled {len(new_schedule)} tasks.",
        }

    def _replan_default(
        self,
        protected: List[Dict],
        deferrable: List[Dict],
        energy_forecast: List[float],
        current_hour: int,
    ) -> Dict:
        """Default replan: priority ordering."""
        all_tasks = sorted(
            protected + deferrable,
            key=lambda t: t.get("priority", 3),
            reverse=True,
        )

        new_schedule = []
        deferred = []
        hour = current_hour

        for task in all_tasks:
            if hour >= 22:
                deferred.append(task)
                continue

            est_hours = max(1, (task.get("estimated_minutes", 60) + 30) // 60)
            new_schedule.append({
                "task_id": task.get("id"),
                "task_title": task.get("title"),
                "start_hour": hour,
                "end_hour": min(hour + est_hours, 22),
            })
            hour += est_hours

        return {
            "new_schedule": new_schedule,
            "deferred_tasks": deferred,
            "tasks_affected": len(all_tasks),
            "strategy": "priority_reorder",
            "summary": f"Rescheduled {len(new_schedule)} tasks by priority.",
        }

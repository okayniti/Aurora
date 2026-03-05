"""
AURORA — Synthetic Data Seeder
Generates synthetic behavioral data for development and testing.
"""

import asyncio
import uuid
import random
import numpy as np
from datetime import datetime, timedelta

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.connection import async_session_factory, init_db
from app.database.models import User, EnergyLog, Task, BurnoutSnapshot


async def seed():
    """Generate synthetic data for a demo user."""
    await init_db()

    async with async_session_factory() as session:
        # Create demo user
        user = User(
            email="demo@aurora.ai",
            name="Demo User",
            identity_desc=(
                "I am a disciplined machine learning engineer who values deep work, "
                "continuous learning, and building impactful AI systems. I prioritize "
                "research, code quality, and long-term career growth over short-term gains."
            ),
        )
        session.add(user)
        await session.flush()
        user_id = user.id
        print(f"✅ Created user: {user.name} ({user_id})")

        # Seed energy logs (past 14 days, hourly)
        base_energy = [
            3.0, 2.5, 2.0, 1.5, 1.0, 1.5,
            3.0, 5.0, 7.0, 8.0, 8.5, 8.0,
            7.0, 6.0, 5.5, 6.5, 7.0, 7.5,
            7.0, 6.5, 6.0, 5.0, 4.0, 3.5,
        ]

        now = datetime.utcnow()
        energy_count = 0
        for day_offset in range(14, 0, -1):
            for hour in range(24):
                timestamp = now - timedelta(days=day_offset, hours=24 - hour)
                noise = random.gauss(0, 0.8)
                energy = max(0, min(10, base_energy[hour] + noise))

                log = EnergyLog(
                    user_id=user_id,
                    timestamp=timestamp,
                    energy_level=round(energy, 1),
                    is_predicted=False,
                    sleep_hours=round(random.uniform(5.5, 9.0), 1),
                    caffeine_intake=random.randint(0, 4),
                    exercise_mins=random.choice([0, 0, 0, 20, 30, 45, 60]),
                )
                session.add(log)
                energy_count += 1

        print(f"✅ Seeded {energy_count} energy logs")

        # Seed tasks
        task_templates = [
            ("Implement LSTM energy model", "Build PyTorch model for energy prediction", 8.0, 120, 5, "coding"),
            ("Review PR #42", "Code review for scheduler refactor", 4.0, 30, 3, "review"),
            ("Write system design doc", "Architecture document for burnout module", 6.0, 90, 4, "writing"),
            ("Team standup meeting", "Daily sync with the team", 2.0, 15, 2, "meetings"),
            ("Research transformer architectures", "Explore attention mechanisms for embeddings", 7.0, 60, 4, "research"),
            ("Fix database migration", "Resolve conflict in Alembic migration", 5.0, 45, 3, "coding"),
            ("Deploy staging build", "Push latest changes to staging environment", 3.0, 30, 3, "devops"),
            ("Read RL scheduling paper", "Arxiv paper on RL-based task scheduling", 6.0, 60, 3, "research"),
            ("Update README documentation", "Add API docs and installation guide", 4.0, 45, 2, "writing"),
            ("Optimize database queries", "Performance tuning for analytics queries", 7.0, 90, 4, "coding"),
        ]

        for title, desc, diff, est_min, priority, category in task_templates:
            status = random.choice(["pending", "pending", "pending", "done", "in_progress"])
            task = Task(
                user_id=user_id,
                title=title,
                description=desc,
                difficulty=diff,
                estimated_minutes=est_min,
                priority=priority,
                category=category,
                status=status,
                actual_minutes=est_min + random.randint(-15, 30) if status == "done" else None,
                completed_at=now - timedelta(hours=random.randint(1, 48)) if status == "done" else None,
            )
            session.add(task)

        print(f"✅ Seeded {len(task_templates)} tasks")

        # Seed burnout snapshots (past 30 days)
        for day_offset in range(30, 0, -1):
            timestamp = now - timedelta(days=day_offset)
            snapshot = BurnoutSnapshot(
                user_id=user_id,
                timestamp=timestamp,
                burnout_probability=round(random.uniform(0.1, 0.6), 3),
                sleep_trend=round(random.uniform(5.5, 8.5), 1),
                deep_work_streak=random.randint(0, 6),
                stress_trend=round(random.uniform(0.1, 0.7), 2),
                energy_variance=round(random.uniform(0.5, 4.0), 2),
                cognitive_load=round(random.uniform(3.0, 20.0), 1),
                feature_importance={
                    "sleep_trend": round(random.uniform(0.1, 0.3), 3),
                    "deep_work_streak": round(random.uniform(0.1, 0.2), 3),
                    "stress_trend": round(random.uniform(0.2, 0.4), 3),
                    "energy_variance": round(random.uniform(0.05, 0.15), 3),
                    "cognitive_load": round(random.uniform(0.1, 0.25), 3),
                },
            )
            session.add(snapshot)

        print(f"✅ Seeded 30 burnout snapshots")

        await session.commit()
        print(f"\n🚀 Seed complete! User ID: {user_id}")
        print(f"   Use this ID for API requests.")


if __name__ == "__main__":
    asyncio.run(seed())

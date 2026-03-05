"""
AURORA Identity Service
Business logic for identity-task alignment.
"""

from typing import Dict, List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, update
import logging

from app.database.models import User, Task, IdentityEmbedding
from app.ml.identity_engine.embeddings import EmbeddingService
from app.ml.identity_engine.alignment import AlignmentScorer

logger = logging.getLogger("aurora.services.identity")


class IdentityService:
    def __init__(self):
        self.embedding_service = EmbeddingService()
        self.scorer = AlignmentScorer(self.embedding_service)

    async def update_identity(
        self, session: AsyncSession, user_id: UUID, identity_desc: str
    ) -> Dict:
        """Update user's identity description and cache embedding."""
        # Update user record
        await session.execute(
            update(User).where(User.id == user_id).values(identity_desc=identity_desc)
        )

        # Compute and cache embedding
        embedding = self.embedding_service.encode(identity_desc)
        serialized = self.embedding_service.serialize_embedding(embedding)

        identity_emb = IdentityEmbedding(
            user_id=user_id,
            text_input=identity_desc,
            embedding=serialized,
            embedding_model=self.embedding_service.model_name,
        )
        session.add(identity_emb)

        return {"user_id": str(user_id), "status": "identity_updated", "embedding_dim": len(embedding)}

    async def compute_alignment(
        self, session: AsyncSession, user_id: UUID,
        task_id: UUID = None, task_description: str = None,
    ) -> Dict:
        """Compute alignment score for a single task."""
        # Get identity description
        user = await session.get(User, user_id)
        if not user or not user.identity_desc:
            return {"error": "Identity description not set"}

        # Get task description
        if task_id:
            task = await session.get(Task, task_id)
            if not task:
                return {"error": "Task not found"}
            task_desc = f"{task.title}. {task.description or ''}"
        elif task_description:
            task_desc = task_description
        else:
            return {"error": "Either task_id or task_description is required"}

        result = self.scorer.compute_alignment(user.identity_desc, task_desc)
        result["user_id"] = str(user_id)
        if task_id:
            result["task_id"] = str(task_id)
            # Cache the alignment score
            await session.execute(
                update(Task).where(Task.id == task_id)
                .values(identity_alignment=result["alignment_score"] / 100.0)
            )

        return result

    async def get_all_scores(
        self, session: AsyncSession, user_id: UUID
    ) -> Dict:
        """Compute alignment scores for all user tasks."""
        user = await session.get(User, user_id)
        if not user or not user.identity_desc:
            return {"user_id": str(user_id), "scores": [], "error": "Identity not set"}

        query = select(Task).where(Task.user_id == user_id)
        result = await session.execute(query)
        tasks = result.scalars().all()

        descriptions = [f"{t.title}. {t.description or ''}" for t in tasks]
        task_ids = [str(t.id) for t in tasks]

        scores = self.scorer.compute_batch_alignment(
            user.identity_desc, descriptions, task_ids
        )

        # Cache scores
        for score_entry in scores:
            tid = score_entry["task_id"]
            alignment = score_entry["alignment_score"] / 100.0
            for task in tasks:
                if str(task.id) == tid:
                    task.identity_alignment = alignment

        return {"user_id": str(user_id), "scores": scores}

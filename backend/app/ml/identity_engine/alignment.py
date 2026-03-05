"""
AURORA Identity Alignment Engine — Alignment Scoring
Computes cosine similarity between identity and task embeddings.
"""

import numpy as np
import logging
from typing import Dict, List, Optional

from app.ml.identity_engine.embeddings import EmbeddingService

logger = logging.getLogger("aurora.identity.alignment")


class AlignmentScorer:
    """
    Computes how well a task aligns with the user's identity goals.

    Process:
    1. Encode identity description → identity_embedding
    2. Encode task description → task_embedding
    3. Compute cosine similarity → alignment score (0-100%)
    """

    def __init__(self, embedding_service: Optional[EmbeddingService] = None):
        self.embedding_service = embedding_service or EmbeddingService()

    def cosine_similarity(self, vec_a: np.ndarray, vec_b: np.ndarray) -> float:
        """
        Compute cosine similarity between two vectors.

        Returns:
            Similarity score in [-1, 1], typically [0, 1] for text embeddings
        """
        norm_a = np.linalg.norm(vec_a)
        norm_b = np.linalg.norm(vec_b)

        if norm_a == 0 or norm_b == 0:
            return 0.0

        return float(np.dot(vec_a, vec_b) / (norm_a * norm_b))

    def compute_alignment(
        self,
        identity_desc: str,
        task_desc: str,
        identity_embedding: Optional[np.ndarray] = None,
    ) -> Dict:
        """
        Compute alignment score between identity and a single task.

        Args:
            identity_desc: User's identity description
            task_desc: Task description
            identity_embedding: Pre-computed identity embedding (for caching)

        Returns:
            Dict with alignment_score (0-100), raw_similarity, interpretation
        """
        if identity_embedding is None:
            identity_embedding = self.embedding_service.encode(identity_desc)

        task_embedding = self.embedding_service.encode(task_desc)

        raw_similarity = self.cosine_similarity(identity_embedding, task_embedding)

        # Scale to 0-100 percentage
        # Cosine similarity for text embeddings typically ranges [0, 0.8]
        # Map this to a more interpretable [0, 100] scale
        alignment_score = float(np.clip(raw_similarity * 125, 0, 100))

        return {
            "alignment_score": round(alignment_score, 1),
            "raw_similarity": round(raw_similarity, 4),
            "interpretation": self._interpret_alignment(alignment_score),
            "identity_desc": identity_desc,
            "task_desc": task_desc,
        }

    def compute_batch_alignment(
        self,
        identity_desc: str,
        task_descriptions: List[str],
        task_ids: Optional[List[str]] = None,
    ) -> List[Dict]:
        """
        Compute alignment scores for multiple tasks at once.

        Args:
            identity_desc: User's identity description
            task_descriptions: List of task descriptions
            task_ids: Optional task IDs for tracking

        Returns:
            List of alignment results, sorted by score (descending)
        """
        identity_embedding = self.embedding_service.encode(identity_desc)
        task_embeddings = self.embedding_service.encode_batch(task_descriptions)

        results = []
        for i, (desc, task_emb) in enumerate(zip(task_descriptions, task_embeddings)):
            raw_sim = self.cosine_similarity(identity_embedding, task_emb)
            score = float(np.clip(raw_sim * 125, 0, 100))

            result = {
                "task_id": task_ids[i] if task_ids else f"task_{i}",
                "task_description": desc,
                "alignment_score": round(score, 1),
                "raw_similarity": round(raw_sim, 4),
            }
            results.append(result)

        # Sort by alignment score descending
        results.sort(key=lambda x: x["alignment_score"], reverse=True)
        return results

    @staticmethod
    def _interpret_alignment(score: float) -> str:
        """Convert alignment score to human-readable interpretation."""
        if score >= 80:
            return "strongly_aligned"
        elif score >= 60:
            return "well_aligned"
        elif score >= 40:
            return "moderately_aligned"
        elif score >= 20:
            return "weakly_aligned"
        else:
            return "not_aligned"

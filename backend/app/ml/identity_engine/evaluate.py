"""
AURORA Identity Engine — Evaluation
Metrics for embedding quality and alignment accuracy.
"""

import numpy as np
import logging
from typing import Dict, List

logger = logging.getLogger("aurora.identity.evaluate")


def evaluate_alignment_quality(
    alignment_scores: List[float],
    user_ratings: List[float],  # Ground truth: user's own alignment ratings
) -> Dict[str, float]:
    """
    Evaluate alignment quality against user self-ratings.

    Args:
        alignment_scores: Model-computed alignment scores (0-100)
        user_ratings: User-provided alignment ratings (0-100)

    Returns:
        Dict with correlation, MAE, and rank metrics
    """
    scores = np.array(alignment_scores)
    ratings = np.array(user_ratings)

    # Pearson correlation
    if len(scores) > 1 and np.std(scores) > 0 and np.std(ratings) > 0:
        correlation = float(np.corrcoef(scores, ratings)[0, 1])
    else:
        correlation = 0.0

    # MAE
    mae = float(np.mean(np.abs(scores - ratings)))

    # Rank correlation (Spearman)
    if len(scores) > 1:
        score_ranks = scores.argsort().argsort()
        rating_ranks = ratings.argsort().argsort()
        n = len(scores)
        d_sq = np.sum((score_ranks - rating_ranks) ** 2)
        spearman = float(1 - (6 * d_sq) / (n * (n ** 2 - 1)))
    else:
        spearman = 0.0

    metrics = {
        "pearson_correlation": round(correlation, 4),
        "mae": round(mae, 2),
        "spearman_rank_correlation": round(spearman, 4),
        "num_samples": len(scores),
    }

    logger.info(f"Alignment evaluation: {metrics}")
    return metrics

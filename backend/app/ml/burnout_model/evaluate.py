"""
AURORA Burnout Model — Evaluation
Comprehensive evaluation metrics for the burnout classifier.
"""

import numpy as np
import logging
from typing import Dict

from app.utils.metrics import calculate_classification_metrics

logger = logging.getLogger("aurora.burnout.evaluate")


def evaluate_burnout_model(
    y_true: np.ndarray,
    y_pred_proba: np.ndarray,
) -> Dict[str, float]:
    """
    Full evaluation of burnout classifier.

    Returns:
        Dict with AUC-ROC, F1, Precision, Recall, Brier score, accuracy
    """
    metrics = calculate_classification_metrics(y_true, y_pred_proba)

    logger.info(
        f"Burnout evaluation: AUC={metrics['auc_roc']:.3f}, "
        f"F1={metrics['f1']:.3f}, Brier={metrics['brier_score']:.3f}"
    )

    return metrics

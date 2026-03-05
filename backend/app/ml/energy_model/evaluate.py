"""
AURORA Energy Model — Evaluation Module
Comprehensive evaluation of energy forecasting performance.
"""

import numpy as np
import logging
from typing import Dict, List

from app.utils.metrics import calculate_regression_metrics

logger = logging.getLogger("aurora.energy.evaluate")


def evaluate_energy_forecast(
    y_true: np.ndarray,
    y_pred: np.ndarray,
) -> Dict[str, float]:
    """
    Full evaluation of energy forecast quality.

    Args:
        y_true: Actual energy values, shape (n_samples, 24) or flat
        y_pred: Predicted energy values, same shape

    Returns:
        Dict with MAE, RMSE, R², directional accuracy, and per-hour bias
    """
    y_true_flat = y_true.flatten()
    y_pred_flat = y_pred.flatten()

    base_metrics = calculate_regression_metrics(y_true_flat, y_pred_flat)

    # Per-hour bias analysis
    if y_true.ndim == 2 and y_true.shape[1] == 24:
        per_hour_mae = []
        for h in range(24):
            hour_mae = np.mean(np.abs(y_true[:, h] - y_pred[:, h]))
            per_hour_mae.append(float(round(hour_mae, 3)))
        base_metrics["per_hour_mae"] = per_hour_mae
        base_metrics["worst_hour"] = int(np.argmax(per_hour_mae))
        base_metrics["best_hour"] = int(np.argmin(per_hour_mae))

    logger.info(f"Energy model evaluation: MAE={base_metrics['mae']:.3f}, "
                f"RMSE={base_metrics['rmse']:.3f}, R²={base_metrics['r_squared']:.3f}")

    return base_metrics

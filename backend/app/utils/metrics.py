"""
AURORA Evaluation Metrics Utility
Common metrics calculations shared across ML modules.
"""

import numpy as np
from typing import Dict, List


def calculate_regression_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, float]:
    """Calculate MAE, RMSE, R², and directional accuracy for regression tasks."""
    mae = np.mean(np.abs(y_true - y_pred))
    rmse = np.sqrt(np.mean((y_true - y_pred) ** 2))

    ss_res = np.sum((y_true - y_pred) ** 2)
    ss_tot = np.sum((y_true - np.mean(y_true)) ** 2)
    r_squared = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0.0

    # Directional accuracy: did we predict the right direction of change?
    if len(y_true) > 1:
        true_dir = np.diff(y_true) > 0
        pred_dir = np.diff(y_pred) > 0
        directional_accuracy = np.mean(true_dir == pred_dir)
    else:
        directional_accuracy = 0.0

    return {
        "mae": float(mae),
        "rmse": float(rmse),
        "r_squared": float(r_squared),
        "directional_accuracy": float(directional_accuracy),
    }


def calculate_classification_metrics(
    y_true: np.ndarray, y_pred_proba: np.ndarray, threshold: float = 0.5
) -> Dict[str, float]:
    """Calculate AUC-ROC, F1, Precision, Recall, and Brier score for classification."""
    y_pred = (y_pred_proba >= threshold).astype(int)

    tp = np.sum((y_pred == 1) & (y_true == 1))
    fp = np.sum((y_pred == 1) & (y_true == 0))
    fn = np.sum((y_pred == 0) & (y_true == 1))
    tn = np.sum((y_pred == 0) & (y_true == 0))

    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0.0

    # Brier score (lower is better)
    brier = np.mean((y_pred_proba - y_true) ** 2)

    # Simplified AUC using trapezoidal method
    auc = _calculate_auc_roc(y_true, y_pred_proba)

    return {
        "precision": float(precision),
        "recall": float(recall),
        "f1": float(f1),
        "brier_score": float(brier),
        "auc_roc": float(auc),
        "accuracy": float((tp + tn) / len(y_true)) if len(y_true) > 0 else 0.0,
    }


def _calculate_auc_roc(y_true: np.ndarray, y_scores: np.ndarray) -> float:
    """Calculate AUC-ROC using the trapezoidal rule."""
    sorted_indices = np.argsort(-y_scores)
    y_true_sorted = y_true[sorted_indices]

    total_pos = np.sum(y_true)
    total_neg = len(y_true) - total_pos

    if total_pos == 0 or total_neg == 0:
        return 0.5

    tpr_list = [0.0]
    fpr_list = [0.0]
    tp_count = 0
    fp_count = 0

    for label in y_true_sorted:
        if label == 1:
            tp_count += 1
        else:
            fp_count += 1
        tpr_list.append(tp_count / total_pos)
        fpr_list.append(fp_count / total_neg)

    auc = np.trapz(tpr_list, fpr_list)
    return float(auc)


def calculate_rl_metrics(
    episode_rewards: List[float],
    completion_rates: List[float],
    burnout_rates: List[float],
) -> Dict[str, float]:
    """Calculate RL agent performance metrics."""
    return {
        "avg_reward": float(np.mean(episode_rewards)) if episode_rewards else 0.0,
        "reward_std": float(np.std(episode_rewards)) if episode_rewards else 0.0,
        "max_reward": float(np.max(episode_rewards)) if episode_rewards else 0.0,
        "avg_completion_rate": float(np.mean(completion_rates)) if completion_rates else 0.0,
        "burnout_avoidance_rate": float(1.0 - np.mean(burnout_rates)) if burnout_rates else 1.0,
    }

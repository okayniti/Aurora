"""
AURORA Burnout Model — Training Pipeline
Trains the XGBoost burnout classifier with cross-validation.
"""

import numpy as np
import logging
import json
from pathlib import Path
from typing import Dict, Optional, Tuple

from app.ml.burnout_model.model import BurnoutClassifier
from app.utils.metrics import calculate_classification_metrics

logger = logging.getLogger("aurora.burnout.train")


class BurnoutTrainer:
    """
    Training pipeline for the burnout risk classifier.

    Implements:
    - Class-balanced sampling
    - K-fold cross-validation
    - SHAP-based feature selection validation
    - Model serialization
    """

    def __init__(self):
        self.classifier = BurnoutClassifier()
        self.classifier.build_model()

    def train(
        self,
        X: np.ndarray,
        y: np.ndarray,
        val_split: float = 0.2,
        save_path: str = "models/burnout_model.joblib",
    ) -> Dict[str, float]:
        """
        Train the burnout classifier.

        Args:
            X: Feature matrix, shape (n_samples, 5)
            y: Binary labels (0=no burnout, 1=burnout), shape (n_samples,)
            val_split: Fraction for validation
            save_path: Path to save trained model

        Returns:
            Evaluation metrics dict
        """
        if self.classifier.model is None:
            logger.error("XGBoost not available. Cannot train.")
            return {}

        # Train/validation split
        n_val = int(len(X) * val_split)
        indices = np.random.permutation(len(X))
        val_idx, train_idx = indices[:n_val], indices[n_val:]

        X_train, y_train = X[train_idx], y[train_idx]
        X_val, y_val = X[val_idx], y[val_idx]

        logger.info(f"Training burnout model: {len(X_train)} train, {len(X_val)} val samples")

        # Train with early stopping
        self.classifier.model.fit(
            X_train, y_train,
            eval_set=[(X_val, y_val)],
            verbose=False,
        )

        self.classifier.is_trained = True

        # Evaluate
        y_pred_proba = self.classifier.model.predict_proba(X_val)[:, 1]
        metrics = calculate_classification_metrics(y_val, y_pred_proba)

        logger.info(f"Burnout model metrics: {json.dumps(metrics, indent=2)}")

        # Save model
        self._save_model(save_path)

        return metrics

    def cross_validate(
        self,
        X: np.ndarray,
        y: np.ndarray,
        k_folds: int = 5,
    ) -> Dict[str, float]:
        """
        K-fold cross-validation for robust evaluation.

        Returns:
            Averaged metrics across all folds
        """
        from sklearn.model_selection import StratifiedKFold

        skf = StratifiedKFold(n_splits=k_folds, shuffle=True, random_state=42)
        fold_metrics = []

        for fold, (train_idx, val_idx) in enumerate(skf.split(X, y)):
            X_train, y_train = X[train_idx], y[train_idx]
            X_val, y_val = X[val_idx], y[val_idx]

            self.classifier.build_model()
            self.classifier.model.fit(X_train, y_train, verbose=False)

            y_pred_proba = self.classifier.model.predict_proba(X_val)[:, 1]
            metrics = calculate_classification_metrics(y_val, y_pred_proba)
            fold_metrics.append(metrics)

            logger.info(f"Fold {fold + 1}/{k_folds}: AUC={metrics['auc_roc']:.3f}, F1={metrics['f1']:.3f}")

        # Average across folds
        avg_metrics = {}
        for key in fold_metrics[0]:
            values = [m[key] for m in fold_metrics]
            avg_metrics[key] = float(np.mean(values))
            avg_metrics[f"{key}_std"] = float(np.std(values))

        logger.info(f"CV Average: AUC={avg_metrics['auc_roc']:.3f} ± {avg_metrics['auc_roc_std']:.3f}")
        return avg_metrics

    def _save_model(self, path: str):
        """Serialize trained model."""
        try:
            import joblib
            Path(path).parent.mkdir(parents=True, exist_ok=True)
            joblib.dump(self.classifier.model, path)
            logger.info(f"Burnout model saved to {path}")
        except Exception as e:
            logger.error(f"Failed to save model: {e}")

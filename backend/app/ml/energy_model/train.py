"""
AURORA Energy Model — Training Pipeline
Trains the LSTM energy forecasting model on historical behavioral data.
"""

import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset
import numpy as np
import json
import logging
from pathlib import Path
from typing import Optional, Dict

from app.ml.energy_model.model import EnergyLSTM
from app.ml.energy_model.features import EnergyFeatureEngineer
from app.utils.metrics import calculate_regression_metrics

logger = logging.getLogger("aurora.energy.train")


class EnergyTrainer:
    """
    Training pipeline for the Energy LSTM model.

    Implements:
    - Sliding window dataset creation
    - Train/validation split
    - Early stopping
    - Checkpoint saving
    - Metrics logging
    """

    def __init__(
        self,
        model: Optional[EnergyLSTM] = None,
        learning_rate: float = 1e-3,
        weight_decay: float = 1e-5,
        device: str = "cpu",
    ):
        self.device = torch.device(device)
        self.model = model or EnergyLSTM()
        self.model.to(self.device)

        self.optimizer = torch.optim.Adam(
            self.model.parameters(),
            lr=learning_rate,
            weight_decay=weight_decay,
        )
        self.criterion = nn.MSELoss()
        self.scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
            self.optimizer, mode="min", patience=5, factor=0.5,
        )
        self.feature_engineer = EnergyFeatureEngineer()
        self.training_history: list = []

    def create_sliding_window_dataset(
        self,
        energy_data: np.ndarray,
        features_data: np.ndarray,
        window_size: int = 168,
        forecast_horizon: int = 24,
    ) -> tuple:
        """
        Create sliding window sequences from time-series data.

        Args:
            energy_data: Array of energy levels, shape (total_hours,)
            features_data: Array of features, shape (total_hours, num_features)
            window_size: Input sequence length (168 = 7 days)
            forecast_horizon: Number of hours to predict (24)

        Returns:
            X: Input sequences, shape (num_windows, window_size, num_features)
            y: Target energy values, shape (num_windows, forecast_horizon)
        """
        X, y = [], []
        total_len = len(energy_data)

        for i in range(total_len - window_size - forecast_horizon + 1):
            X.append(features_data[i:i + window_size])
            y.append(energy_data[i + window_size:i + window_size + forecast_horizon] / 10.0)

        return np.array(X, dtype=np.float32), np.array(y, dtype=np.float32)

    def train(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray,
        X_val: Optional[np.ndarray] = None,
        y_val: Optional[np.ndarray] = None,
        epochs: int = 100,
        batch_size: int = 32,
        early_stopping_patience: int = 10,
        save_path: str = "models/energy_model.pt",
    ) -> Dict[str, list]:
        """
        Train the LSTM model.

        Args:
            X_train: Training input, shape (n_samples, seq_len, features)
            y_train: Training targets, shape (n_samples, forecast_horizon)
            X_val: Validation input
            y_val: Validation targets
            epochs: Maximum training epochs
            batch_size: Mini-batch size
            early_stopping_patience: Epochs to wait before stopping
            save_path: Path to save best model checkpoint

        Returns:
            Training history dict with train_loss and val_loss lists
        """
        train_dataset = TensorDataset(
            torch.FloatTensor(X_train),
            torch.FloatTensor(y_train),
        )
        train_loader = DataLoader(
            train_dataset, batch_size=batch_size, shuffle=True
        )

        best_val_loss = float("inf")
        patience_counter = 0
        history = {"train_loss": [], "val_loss": []}

        logger.info(f"Starting training: {epochs} epochs, {len(X_train)} samples")

        for epoch in range(epochs):
            # Training phase
            self.model.train()
            epoch_losses = []

            for batch_X, batch_y in train_loader:
                batch_X = batch_X.to(self.device)
                batch_y = batch_y.to(self.device)

                self.optimizer.zero_grad()
                predictions = self.model(batch_X)
                loss = self.criterion(predictions, batch_y)
                loss.backward()

                # Gradient clipping for LSTM stability
                torch.nn.utils.clip_grad_norm_(self.model.parameters(), max_norm=1.0)

                self.optimizer.step()
                epoch_losses.append(loss.item())

            avg_train_loss = np.mean(epoch_losses)
            history["train_loss"].append(avg_train_loss)

            # Validation phase
            if X_val is not None and y_val is not None:
                val_loss = self._validate(X_val, y_val)
                history["val_loss"].append(val_loss)
                self.scheduler.step(val_loss)

                if val_loss < best_val_loss:
                    best_val_loss = val_loss
                    patience_counter = 0
                    self._save_checkpoint(save_path, epoch, val_loss)
                else:
                    patience_counter += 1

                if epoch % 10 == 0:
                    logger.info(
                        f"Epoch {epoch}/{epochs} | "
                        f"Train Loss: {avg_train_loss:.6f} | "
                        f"Val Loss: {val_loss:.6f} | "
                        f"Best: {best_val_loss:.6f}"
                    )

                if patience_counter >= early_stopping_patience:
                    logger.info(f"Early stopping at epoch {epoch}")
                    break
            else:
                if epoch % 10 == 0:
                    logger.info(f"Epoch {epoch}/{epochs} | Train Loss: {avg_train_loss:.6f}")

        self.training_history = history
        return history

    def _validate(self, X_val: np.ndarray, y_val: np.ndarray) -> float:
        """Calculate validation loss."""
        self.model.eval()
        with torch.no_grad():
            X_tensor = torch.FloatTensor(X_val).to(self.device)
            y_tensor = torch.FloatTensor(y_val).to(self.device)
            predictions = self.model(X_tensor)
            loss = self.criterion(predictions, y_tensor)
        return loss.item()

    def _save_checkpoint(self, path: str, epoch: int, val_loss: float):
        """Save model checkpoint."""
        Path(path).parent.mkdir(parents=True, exist_ok=True)
        torch.save({
            "epoch": epoch,
            "model_state_dict": self.model.state_dict(),
            "optimizer_state_dict": self.optimizer.state_dict(),
            "val_loss": val_loss,
            "model_config": {
                "input_dim": self.model.input_dim,
                "hidden_dim": self.model.hidden_dim,
                "num_layers": self.model.num_layers,
                "forecast_horizon": self.model.forecast_horizon,
            },
        }, path)
        logger.info(f"Checkpoint saved: {path} (epoch {epoch}, val_loss {val_loss:.6f})")

    def evaluate(self, X_test: np.ndarray, y_test: np.ndarray) -> Dict[str, float]:
        """
        Evaluate model on test data and return comprehensive metrics.

        Returns:
            Dict with MAE, RMSE, R², directional accuracy
        """
        self.model.eval()
        with torch.no_grad():
            X_tensor = torch.FloatTensor(X_test).to(self.device)
            predictions = self.model(X_tensor).cpu().numpy()

        # Scale back to 0-10
        y_true = y_test * 10.0
        y_pred = predictions * 10.0

        # Flatten for metric calculation
        metrics = calculate_regression_metrics(y_true.flatten(), y_pred.flatten())
        logger.info(f"Evaluation metrics: {json.dumps(metrics, indent=2)}")
        return metrics

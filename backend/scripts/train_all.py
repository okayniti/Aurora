"""
AURORA — Run All Training Pipelines
Orchestrates training of all ML models.
"""

import asyncio
import logging
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.utils.logger import setup_logger

logger = setup_logger("aurora.train_all")


def train_energy_model():
    """Train the LSTM energy forecasting model on synthetic data."""
    import numpy as np
    from app.ml.energy_model.model import EnergyLSTM
    from app.ml.energy_model.train import EnergyTrainer

    logger.info("═" * 50)
    logger.info("Training Energy Forecasting Model (LSTM)")
    logger.info("═" * 50)

    # Generate synthetic training data
    np.random.seed(42)
    total_hours = 24 * 30  # 30 days

    base = np.tile([
        3.0, 2.5, 2.0, 1.5, 1.0, 1.5,
        3.0, 5.0, 7.0, 8.0, 8.5, 8.0,
        7.0, 6.0, 5.5, 6.5, 7.0, 7.5,
        7.0, 6.5, 6.0, 5.0, 4.0, 3.5,
    ], 30)

    energy_data = base + np.random.normal(0, 0.5, total_hours)
    energy_data = np.clip(energy_data, 0, 10)

    # Generate feature data
    features_data = np.random.rand(total_hours, 6).astype(np.float32)

    model = EnergyLSTM(input_dim=6, hidden_dim=64, num_layers=2)
    trainer = EnergyTrainer(model=model, learning_rate=1e-3)

    X, y = trainer.create_sliding_window_dataset(energy_data, features_data, window_size=168)

    n_val = max(1, int(len(X) * 0.2))
    X_train, y_train = X[:-n_val], y[:-n_val]
    X_val, y_val = X[-n_val:], y[-n_val:]

    history = trainer.train(
        X_train, y_train, X_val, y_val,
        epochs=50, batch_size=16,
        save_path="models/energy_model.pt",
    )

    metrics = trainer.evaluate(X_val, y_val)
    logger.info(f"Energy model metrics: {metrics}")


def train_burnout_model():
    """Train the XGBoost burnout classifier on synthetic data."""
    import numpy as np
    from app.ml.burnout_model.train import BurnoutTrainer

    logger.info("═" * 50)
    logger.info("Training Burnout Risk Classifier (XGBoost + SHAP)")
    logger.info("═" * 50)

    np.random.seed(42)
    n_samples = 2000

    # Synthetic features: sleep_trend, deep_work_streak, stress_trend, energy_variance, cognitive_load
    X = np.column_stack([
        np.random.uniform(4.0, 9.0, n_samples),    # sleep_trend
        np.random.randint(0, 7, n_samples),          # deep_work_streak
        np.random.uniform(0.0, 1.0, n_samples),     # stress_trend
        np.random.uniform(0.3, 5.0, n_samples),     # energy_variance
        np.random.uniform(2.0, 25.0, n_samples),    # cognitive_load
    ])

    # Burnout labels: stressed + exhausted = burnout
    burnout_score = (
        -0.3 * X[:, 0]      # less sleep → more burnout
        + 0.15 * X[:, 1]    # long deep work streaks → more burnout
        + 0.35 * X[:, 2]    # stress → burnout
        + 0.1 * X[:, 3]     # high energy variance → burnout
        + 0.02 * X[:, 4]    # cognitive load → burnout
        + np.random.normal(0, 0.3, n_samples)  # noise
    )
    y = (burnout_score > np.percentile(burnout_score, 65)).astype(int)

    logger.info(f"Dataset: {n_samples} samples, {y.sum()} burnout positives ({y.mean():.1%})")

    trainer = BurnoutTrainer()
    metrics = trainer.train(X, y, save_path="models/burnout_model.joblib")
    logger.info(f"Burnout model metrics: {metrics}")


def train_rl_agent():
    """Train the DQN scheduling agent."""
    from app.ml.rl_scheduler.train import RLTrainer

    logger.info("═" * 50)
    logger.info("Training RL Scheduling Agent (DQN)")
    logger.info("═" * 50)

    trainer = RLTrainer()
    history = trainer.train(
        num_episodes=500,
        save_path="models/rl_agent.pt",
        log_interval=50,
    )

    metrics = trainer.evaluate(num_episodes=50)
    logger.info(f"RL agent metrics: {metrics}")


def main():
    logger.info("🚀 AURORA Training Pipeline")
    logger.info("=" * 60)

    train_energy_model()
    train_burnout_model()
    train_rl_agent()

    logger.info("=" * 60)
    logger.info("✅ All training complete!")
    logger.info("Models saved to: models/energy_model.pt, models/burnout_model.joblib, models/rl_agent.pt")


if __name__ == "__main__":
    main()


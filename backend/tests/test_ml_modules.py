"""
AURORA — Unit Tests for ML Modules
"""

import pytest
import numpy as np


class TestEnergyModel:
    """Tests for the Energy Forecasting Engine."""

    def test_heuristic_model_output_length(self):
        from app.ml.energy_model.model import HeuristicEnergyModel
        model = HeuristicEnergyModel()
        predictions = model.predict(sleep_hours=7.0)
        assert len(predictions) == 24

    def test_heuristic_model_output_range(self):
        from app.ml.energy_model.model import HeuristicEnergyModel
        model = HeuristicEnergyModel()
        predictions = model.predict(sleep_hours=5.0, caffeine_intake=3)
        for p in predictions:
            assert 0 <= p <= 10

    def test_lstm_model_shape(self):
        import torch
        from app.ml.energy_model.model import EnergyLSTM
        model = EnergyLSTM(input_dim=6, hidden_dim=32, num_layers=1)
        x = torch.randn(2, 168, 6)
        output = model(x)
        assert output.shape == (2, 24)

    def test_lstm_output_range(self):
        import torch
        from app.ml.energy_model.model import EnergyLSTM
        model = EnergyLSTM()
        x = torch.randn(1, 168, 6)
        output = model(x)
        assert (output >= 0).all() and (output <= 1).all()

    def test_feature_engineering_sequence(self):
        from app.ml.energy_model.features import EnergyFeatureEngineer
        fe = EnergyFeatureEngineer()
        logs = [{"timestamp": "2024-01-01T10:00:00", "sleep_hours": 7, "caffeine_intake": 2, "exercise_mins": 30}] * 100
        seq = fe.build_sequence(logs)
        assert seq.shape == (168, 6)


class TestBurnoutModel:
    """Tests for the Burnout Risk Predictor."""

    def test_rule_based_prediction(self):
        from app.ml.burnout_model.model import BurnoutClassifier
        clf = BurnoutClassifier()
        prob, importance = clf.predict({
            "sleep_trend": 5.0,
            "deep_work_streak": 6,
            "stress_trend": 0.7,
            "energy_variance": 3.5,
            "cognitive_load": 15.0,
        })
        assert 0 <= prob <= 1
        assert len(importance) == 5
        assert abs(sum(importance.values()) - 1.0) < 0.01

    def test_risk_level_categories(self):
        from app.ml.burnout_model.model import BurnoutClassifier
        assert BurnoutClassifier.risk_level(0.1) == "low"
        assert BurnoutClassifier.risk_level(0.3) == "moderate"
        assert BurnoutClassifier.risk_level(0.6) == "high"
        assert BurnoutClassifier.risk_level(0.8) == "critical"


class TestRLScheduler:
    """Tests for the RL Scheduling Environment."""

    def test_environment_reset(self):
        from app.ml.rl_scheduler.environment import TaskSchedulingEnv
        env = TaskSchedulingEnv()
        tasks = [{"title": "Test", "difficulty": 5.0, "priority": 3, "estimated_minutes": 60}]
        state = env.reset(tasks=tasks, energy_forecast=[7.0] * 24)
        assert state.shape == (6,)
        assert all(0 <= s <= 1 for s in state)

    def test_environment_step(self):
        from app.ml.rl_scheduler.environment import TaskSchedulingEnv
        env = TaskSchedulingEnv()
        tasks = [{"title": f"Task {i}", "difficulty": 5.0, "priority": 3, "estimated_minutes": 60} for i in range(3)]
        state = env.reset(tasks=tasks, energy_forecast=[7.0] * 24)
        next_state, reward, done, info = env.step(0)
        assert next_state.shape == (6,)
        assert isinstance(reward, float)

    def test_greedy_scheduler(self):
        from app.ml.rl_scheduler.agent import GreedyScheduler
        scheduler = GreedyScheduler()
        tasks = [
            {"id": "1", "title": "High", "difficulty": 8, "priority": 5, "estimated_minutes": 60},
            {"id": "2", "title": "Low", "difficulty": 3, "priority": 1, "estimated_minutes": 30},
        ]
        schedule = scheduler.schedule(tasks, [7.0] * 24)
        assert len(schedule) == 2
        assert schedule[0]["task_title"] == "High"  # Higher priority first


class TestIdentityEngine:
    """Tests for the Identity Alignment Engine."""

    def test_cosine_similarity(self):
        from app.ml.identity_engine.alignment import AlignmentScorer
        scorer = AlignmentScorer()
        vec_a = np.array([1, 0, 0], dtype=np.float32)
        vec_b = np.array([1, 0, 0], dtype=np.float32)
        assert scorer.cosine_similarity(vec_a, vec_b) == pytest.approx(1.0)

    def test_cosine_similarity_orthogonal(self):
        from app.ml.identity_engine.alignment import AlignmentScorer
        scorer = AlignmentScorer()
        vec_a = np.array([1, 0, 0], dtype=np.float32)
        vec_b = np.array([0, 1, 0], dtype=np.float32)
        assert scorer.cosine_similarity(vec_a, vec_b) == pytest.approx(0.0)


class TestMetrics:
    """Tests for shared evaluation utilities."""

    def test_regression_metrics(self):
        from app.utils.metrics import calculate_regression_metrics
        y_true = np.array([1.0, 2.0, 3.0, 4.0, 5.0])
        y_pred = np.array([1.1, 2.2, 2.8, 4.1, 4.9])
        metrics = calculate_regression_metrics(y_true, y_pred)
        assert "mae" in metrics
        assert "rmse" in metrics
        assert "r_squared" in metrics
        assert metrics["mae"] < 0.3

    def test_classification_metrics(self):
        from app.utils.metrics import calculate_classification_metrics
        y_true = np.array([0, 0, 1, 1, 1])
        y_pred = np.array([0.1, 0.3, 0.7, 0.8, 0.9])
        metrics = calculate_classification_metrics(y_true, y_pred)
        assert "f1" in metrics
        assert "auc_roc" in metrics
        assert metrics["f1"] > 0.5

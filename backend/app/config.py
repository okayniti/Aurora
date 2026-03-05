"""
AURORA Configuration Module
Loads environment variables using Pydantic BaseSettings.
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # App
    APP_NAME: str = "AURORA"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"

    # Database — SQLite for dev, PostgreSQL for production
    DATABASE_URL: str = "sqlite+aiosqlite:///./aurora_dev.db"
    DATABASE_ECHO: bool = False

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000"

    # ML Models
    ENERGY_MODEL_PATH: str = "models/energy_model.pt"
    BURNOUT_MODEL_PATH: str = "models/burnout_model.joblib"
    RL_MODEL_PATH: str = "models/rl_agent.pt"

    # Identity Engine
    EMBEDDING_MODEL_NAME: str = "sentence-transformers/all-MiniLM-L6-v2"

    # RL Scheduler
    RL_LEARNING_RATE: float = 1e-3
    RL_GAMMA: float = 0.99
    RL_EPSILON_START: float = 1.0
    RL_EPSILON_END: float = 0.01
    RL_EPSILON_DECAY: int = 1000
    RL_BATCH_SIZE: int = 64
    RL_MEMORY_SIZE: int = 10000

    # Replanning thresholds
    ENERGY_DEVIATION_THRESHOLD: float = 2.0
    STRESS_SPIKE_THRESHOLD: float = 0.8

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()

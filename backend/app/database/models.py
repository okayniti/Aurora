"""
AURORA Database Models
SQLAlchemy ORM models mapping to the PostgreSQL schema.
"""

import uuid
from datetime import datetime, date
from sqlalchemy import (
    Column, String, Float, Integer, Boolean, Text, Date, DateTime,
    ForeignKey, CheckConstraint, UniqueConstraint, Index, JSON, LargeBinary,
    TypeDecorator, CHAR,
)
from sqlalchemy.orm import relationship
from app.database.connection import Base

# Portable timezone-aware timestamp
TZDateTime = DateTime(timezone=True)


class GUID(TypeDecorator):
    """Platform-independent GUID type.
    Uses CHAR(36) on SQLite, native UUID on PostgreSQL.
    """
    impl = CHAR(36)
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is not None:
            return str(value)
        return value

    def process_result_value(self, value, dialect):
        if value is not None:
            return uuid.UUID(value)
        return value


class User(Base):
    __tablename__ = "users"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    identity_desc = Column(Text, nullable=True)
    created_at = Column(TZDateTime, default=datetime.utcnow)
    updated_at = Column(TZDateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    energy_logs = relationship("EnergyLog", back_populates="user", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="user", cascade="all, delete-orphan")
    burnout_snapshots = relationship("BurnoutSnapshot", back_populates="user", cascade="all, delete-orphan")
    schedule_entries = relationship("ScheduleEntry", back_populates="user", cascade="all, delete-orphan")
    identity_embeddings = relationship("IdentityEmbedding", back_populates="user", cascade="all, delete-orphan")
    analytics_daily = relationship("AnalyticsDaily", back_populates="user", cascade="all, delete-orphan")
    replan_events = relationship("ReplanEvent", back_populates="user", cascade="all, delete-orphan")


class EnergyLog(Base):
    __tablename__ = "energy_logs"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    timestamp = Column(TZDateTime, nullable=False)
    energy_level = Column(Float, nullable=False)
    is_predicted = Column(Boolean, default=False)
    sleep_hours = Column(Float, nullable=True)
    caffeine_intake = Column(Integer, nullable=True)
    exercise_mins = Column(Integer, nullable=True)
    created_at = Column(TZDateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="energy_logs")

    __table_args__ = (
        CheckConstraint("energy_level >= 0 AND energy_level <= 10", name="ck_energy_level_range"),
        Index("idx_energy_user_time", "user_id", "timestamp"),
    )


class Task(Base):
    __tablename__ = "tasks"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    difficulty = Column(Float, nullable=True)
    estimated_minutes = Column(Integer, nullable=True)
    actual_minutes = Column(Integer, nullable=True)
    priority = Column(Integer, default=3)
    category = Column(String(100), nullable=True)
    status = Column(String(50), default="pending")  # pending, in_progress, done, missed
    scheduled_start = Column(TZDateTime, nullable=True)
    scheduled_end = Column(TZDateTime, nullable=True)
    completed_at = Column(TZDateTime, nullable=True)
    identity_alignment = Column(Float, nullable=True)
    created_at = Column(TZDateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="tasks")
    schedule_entries = relationship("ScheduleEntry", back_populates="task", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint("difficulty >= 0 AND difficulty <= 10", name="ck_task_difficulty_range"),
        CheckConstraint("priority >= 1 AND priority <= 5", name="ck_task_priority_range"),
        Index("idx_tasks_user_status", "user_id", "status"),
    )


class BurnoutSnapshot(Base):
    __tablename__ = "burnout_snapshots"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    timestamp = Column(TZDateTime, nullable=False)
    burnout_probability = Column(Float, nullable=False)
    sleep_trend = Column(Float, nullable=True)
    deep_work_streak = Column(Integer, nullable=True)
    stress_trend = Column(Float, nullable=True)
    energy_variance = Column(Float, nullable=True)
    cognitive_load = Column(Float, nullable=True)
    feature_importance = Column(JSON, nullable=True)
    created_at = Column(TZDateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="burnout_snapshots")

    __table_args__ = (
        CheckConstraint("burnout_probability >= 0 AND burnout_probability <= 1", name="ck_burnout_prob_range"),
        Index("idx_burnout_user_time", "user_id", "timestamp"),
    )


class ScheduleEntry(Base):
    __tablename__ = "schedule_entries"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    task_id = Column(GUID(), ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False)
    time_slot_start = Column(TZDateTime, nullable=False)
    time_slot_end = Column(TZDateTime, nullable=False)
    rl_confidence = Column(Float, nullable=True)
    was_completed = Column(Boolean, default=False)
    replan_count = Column(Integer, default=0)
    created_at = Column(TZDateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="schedule_entries")
    task = relationship("Task", back_populates="schedule_entries")

    __table_args__ = (
        Index("idx_schedule_user_date", "user_id", "date"),
    )


class IdentityEmbedding(Base):
    __tablename__ = "identity_embeddings"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    text_input = Column(Text, nullable=False)
    embedding = Column(LargeBinary, nullable=False)
    embedding_model = Column(String(100), nullable=True)
    created_at = Column(TZDateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="identity_embeddings")


class AnalyticsDaily(Base):
    __tablename__ = "analytics_daily"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False)
    deep_work_hours = Column(Float, nullable=True)
    identity_alignment_avg = Column(Float, nullable=True)
    burnout_trend = Column(Float, nullable=True)
    energy_forecast_mae = Column(Float, nullable=True)
    decision_fatigue_index = Column(Float, nullable=True)
    rl_strategy_efficiency = Column(Float, nullable=True)
    tasks_completed = Column(Integer, nullable=True)
    tasks_total = Column(Integer, nullable=True)
    created_at = Column(TZDateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="analytics_daily")

    __table_args__ = (
        UniqueConstraint("user_id", "date", name="uq_analytics_user_date"),
        Index("idx_analytics_user", "user_id", "date"),
    )


class ReplanEvent(Base):
    __tablename__ = "replan_events"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    trigger_type = Column(String(50), nullable=False)  # missed_task, energy_deviation, stress_spike
    trigger_data = Column(JSON, nullable=True)
    tasks_affected = Column(Integer, nullable=True)
    timestamp = Column(TZDateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="replan_events")

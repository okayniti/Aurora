"""
AURORA Pydantic Schemas
Request/response validation schemas for all API endpoints.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from uuid import UUID


# ── User Schemas ──────────────────────────────────────────────

class UserCreate(BaseModel):
    email: str
    name: str
    identity_desc: Optional[str] = None

class UserResponse(BaseModel):
    id: UUID
    email: str
    name: str
    identity_desc: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ── Energy Schemas ────────────────────────────────────────────

class EnergyLogCreate(BaseModel):
    user_id: UUID
    energy_level: float = Field(..., ge=0, le=10)
    sleep_hours: Optional[float] = None
    caffeine_intake: Optional[int] = None
    exercise_mins: Optional[int] = None
    timestamp: Optional[datetime] = None

class EnergyLogResponse(BaseModel):
    id: UUID
    user_id: UUID
    timestamp: datetime
    energy_level: float
    is_predicted: bool
    sleep_hours: Optional[float]
    caffeine_intake: Optional[int]
    exercise_mins: Optional[int]

    class Config:
        from_attributes = True

class EnergyForecastResponse(BaseModel):
    user_id: UUID
    forecast_date: date
    hourly_predictions: List[Dict[str, Any]]  # [{hour: 0, energy: 7.2}, ...]
    model_type: str  # "lstm" or "heuristic"
    confidence: float

class EnergyComparisonResponse(BaseModel):
    user_id: UUID
    date: date
    data_points: List[Dict[str, Any]]  # [{hour, predicted, actual}, ...]


# ── Task Schemas ──────────────────────────────────────────────

class TaskCreate(BaseModel):
    user_id: UUID
    title: str
    description: Optional[str] = None
    difficulty: Optional[float] = Field(None, ge=0, le=10)
    estimated_minutes: Optional[int] = None
    priority: int = Field(3, ge=1, le=5)
    category: Optional[str] = None
    scheduled_start: Optional[datetime] = None
    scheduled_end: Optional[datetime] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    difficulty: Optional[float] = Field(None, ge=0, le=10)
    estimated_minutes: Optional[int] = None
    priority: Optional[int] = Field(None, ge=1, le=5)
    category: Optional[str] = None
    scheduled_start: Optional[datetime] = None
    scheduled_end: Optional[datetime] = None

class TaskStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(pending|in_progress|done|missed)$")
    actual_minutes: Optional[int] = None

class TaskResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    description: Optional[str]
    difficulty: Optional[float]
    estimated_minutes: Optional[int]
    actual_minutes: Optional[int]
    priority: int
    category: Optional[str]
    status: str
    scheduled_start: Optional[datetime]
    scheduled_end: Optional[datetime]
    completed_at: Optional[datetime]
    identity_alignment: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True


# ── Burnout Schemas ───────────────────────────────────────────

class BurnoutSnapshotCreate(BaseModel):
    user_id: UUID
    sleep_trend: Optional[float] = None
    deep_work_streak: Optional[int] = None
    stress_trend: Optional[float] = None
    energy_variance: Optional[float] = None
    cognitive_load: Optional[float] = None

class BurnoutRiskResponse(BaseModel):
    user_id: UUID
    burnout_probability: float
    risk_level: str  # low, moderate, high, critical
    feature_importance: Dict[str, float]
    model_type: str  # "xgboost" or "rule_based"
    timestamp: datetime

class BurnoutTrendResponse(BaseModel):
    user_id: UUID
    data_points: List[Dict[str, Any]]  # [{date, probability, risk_level}, ...]


# ── Scheduler Schemas ─────────────────────────────────────────

class ScheduleOptimizeRequest(BaseModel):
    date: Optional[date] = None  # defaults to today

class ScheduleEntryResponse(BaseModel):
    id: UUID
    task_id: UUID
    task_title: str
    time_slot_start: datetime
    time_slot_end: datetime
    rl_confidence: Optional[float]
    was_completed: bool
    replan_count: int

    class Config:
        from_attributes = True

class ScheduleResponse(BaseModel):
    user_id: UUID
    date: date
    entries: List[ScheduleEntryResponse]
    strategy: str  # "rl" or "greedy"

class SchedulerFeedback(BaseModel):
    schedule_entry_id: UUID
    was_completed: bool
    actual_minutes: Optional[int] = None

class RLEfficiencyResponse(BaseModel):
    user_id: UUID
    avg_reward: float
    completion_rate: float
    burnout_avoidance_rate: float
    schedule_adherence: float


# ── Identity Schemas ──────────────────────────────────────────

class IdentityProfileUpdate(BaseModel):
    user_id: UUID
    identity_desc: str

class IdentityAlignRequest(BaseModel):
    user_id: UUID
    task_id: Optional[UUID] = None
    task_description: Optional[str] = None  # ad-hoc check

class IdentityAlignResponse(BaseModel):
    user_id: UUID
    task_id: Optional[UUID]
    task_description: str
    alignment_score: float  # 0-100
    identity_desc: str

class IdentityScoresResponse(BaseModel):
    user_id: UUID
    scores: List[Dict[str, Any]]  # [{task_id, title, alignment_score}, ...]


# ── Replanning Schemas ────────────────────────────────────────

class ReplanTriggerRequest(BaseModel):
    user_id: UUID
    trigger_type: str = Field(..., pattern="^(missed_task|energy_deviation|stress_spike|manual)$")
    trigger_data: Optional[Dict[str, Any]] = None

class ReplanEventResponse(BaseModel):
    id: UUID
    user_id: UUID
    trigger_type: str
    trigger_data: Optional[Dict[str, Any]]
    tasks_affected: Optional[int]
    timestamp: datetime

    class Config:
        from_attributes = True


# ── Analytics Schemas ─────────────────────────────────────────

class DashboardResponse(BaseModel):
    user_id: UUID
    date: date
    deep_work_hours: float
    identity_alignment_avg: float
    burnout_trend: float
    energy_forecast_mae: float
    decision_fatigue_index: float
    rl_strategy_efficiency: float
    tasks_completed: int
    tasks_total: int

class AnalyticsDailyResponse(BaseModel):
    user_id: UUID
    date: date
    deep_work_hours: Optional[float]
    identity_alignment_avg: Optional[float]
    burnout_trend: Optional[float]
    energy_forecast_mae: Optional[float]
    decision_fatigue_index: Optional[float]
    rl_strategy_efficiency: Optional[float]
    tasks_completed: Optional[int]
    tasks_total: Optional[int]

    class Config:
        from_attributes = True

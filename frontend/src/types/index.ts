// AURORA TypeScript Interfaces

export interface User {
    id: string;
    email: string;
    name: string;
    identity_desc: string | null;
    created_at: string;
}

export interface EnergyPrediction {
    hour: number;
    energy: number;
    timestamp: string;
}

export interface EnergyForecast {
    user_id: string;
    forecast_date: string;
    hourly_predictions: EnergyPrediction[];
    model_type: "lstm" | "heuristic";
    confidence: number;
}

export interface BurnoutRisk {
    user_id: string;
    burnout_probability: number;
    risk_level: "low" | "moderate" | "high" | "critical";
    feature_importance: Record<string, number>;
    model_type: "xgboost" | "rule_based";
    timestamp: string;
}

export interface Task {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    difficulty: number | null;
    estimated_minutes: number | null;
    actual_minutes: number | null;
    priority: number;
    category: string | null;
    status: "pending" | "in_progress" | "done" | "missed";
    identity_alignment: number | null;
    scheduled_start: string | null;
    scheduled_end: string | null;
    created_at: string;
}

export interface ScheduleEntry {
    task_id: string;
    task_title: string;
    time_slot_start_hour: number;
    time_slot_end_hour: number;
    confidence: number;
    predicted_energy?: number;
}

export interface Schedule {
    user_id: string;
    date: string;
    entries: ScheduleEntry[];
    strategy: "rl_dqn" | "greedy" | "none";
    total_confidence: number;
}

export interface DashboardData {
    user_id: string;
    date: string;
    deep_work_hours: number;
    identity_alignment_avg: number;
    burnout_trend: number;
    energy_forecast_mae: number;
    decision_fatigue_index: number;
    rl_strategy_efficiency: number;
    tasks_completed: number;
    tasks_total: number;
}

export interface AlignmentScore {
    task_id: string;
    task_description: string;
    alignment_score: number;
    raw_similarity: number;
}

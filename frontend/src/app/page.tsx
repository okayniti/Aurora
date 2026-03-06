"use client";

import { useState, useEffect, useMemo } from "react";
import { useUser } from "@/lib/UserContext";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import MetricCard from "@/components/layout/MetricCard";
import { ErrorBanner, DemoBadge, MetricSkeleton, ChartSkeleton } from "@/components/ui/Skeleton";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar, LineChart, Line, Cell,
} from "recharts";

// ── Fallback demo data ──────────────────────────────────────
const demoEnergy = Array.from({ length: 24 }, (_, i) => {
    const base = [3, 2.5, 2, 1.5, 1, 1.5, 3, 5, 7, 8, 8.5, 8, 7, 6, 5.5, 6.5, 7, 7.5, 7, 6.5, 6, 5, 4, 3.5];
    return {
        hour: `${String(i).padStart(2, "0")}:00`,
        predicted: +(base[i] + (Math.random() - 0.5)).toFixed(1),
        actual: i < new Date().getHours() ? +(base[i] + (Math.random() - 0.5) * 1.5).toFixed(1) : null,
    };
});

const demoBurnout = Array.from({ length: 30 }, (_, i) => ({
    day: `Day ${i + 1}`,
    probability: +(0.2 + Math.random() * 0.4).toFixed(2),
}));

const demoFeatures = [
    { name: "Stress Trend", value: 0.32, fill: "#fb7185" },
    { name: "Sleep Quality", value: 0.25, fill: "#5c7cfa" },
    { name: "Cognitive Load", value: 0.20, fill: "#fbbf24" },
    { name: "Deep Work Streak", value: 0.13, fill: "#34d399" },
    { name: "Energy Variance", value: 0.10, fill: "#a78bfa" },
];

const demoDashboard = {
    deep_work_hours: 4.2,
    identity_alignment_avg: 73.5,
    burnout_trend: 0.34,
    rl_strategy_efficiency: 0.82,
    energy_forecast_mae: 0.8,
    decision_fatigue_index: 0.42,
    tasks_completed: 6,
    tasks_total: 10,
};

// ── Custom Tooltip ──────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
        return (
            <div className="glass-card p-3 text-xs border border-white/10">
                <p className="text-gray-300 mb-1 font-medium">{label}</p>
                {payload.map((p: any, i: number) => (
                    <p key={i} style={{ color: p.color }} className="font-mono">
                        {p.name}: {p.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function Dashboard() {
    const { userId } = useUser();
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Fetch dashboard data from API (falls back to demo)
    const { data: dashboard, error: dashError, refetch } = useApi(
        () => api.getDashboard(userId!),
        demoDashboard,
        [userId]
    );

    // Fetch energy forecast
    const { data: energyData } = useApi(
        async () => {
            if (!userId) throw new Error("no user");
            const forecast: any = await api.getEnergyForecast(userId);
            return forecast.hourly_predictions?.map((p: any) => ({
                hour: `${String(p.hour).padStart(2, "0")}:00`,
                predicted: +p.energy.toFixed(1),
                actual: null,
            })) || demoEnergy;
        },
        demoEnergy,
        [userId]
    );

    // Fetch burnout trend
    const { data: burnoutData } = useApi(
        async () => {
            if (!userId) throw new Error("no user");
            const trend: any = await api.getBurnoutTrend(userId);
            return trend.map((t: any, i: number) => ({
                day: `Day ${i + 1}`,
                probability: +t.burnout_probability.toFixed(3),
            }));
        },
        demoBurnout,
        [userId]
    );

    // Fetch burnout risk (for feature importance)
    const { data: features } = useApi(
        async () => {
            if (!userId) throw new Error("no user");
            const risk: any = await api.getBurnoutRisk(userId);
            if (!risk.feature_importance) return demoFeatures;
            return Object.entries(risk.feature_importance).map(([name, value], i) => ({
                name: name.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()),
                value: +(value as number).toFixed(3),
                fill: ["#fb7185", "#5c7cfa", "#fbbf24", "#34d399", "#a78bfa"][i % 5],
            }));
        },
        demoFeatures,
        [userId]
    );

    const d = dashboard || demoDashboard;
    const isDemo = !!dashError;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight">
                            Cognitive <span className="gradient-text">Dashboard</span>
                        </h1>
                        {isDemo && <DemoBadge />}
                    </div>
                    <p className="text-gray-500 mt-1 text-sm">
                        Real-time behavioral intelligence overview
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-mono text-gray-300">
                        {time.toLocaleTimeString("en-US", { hour12: false })}
                    </p>
                    <p className="text-xs text-gray-600">
                        {time.toLocaleDateString("en-US", {
                            weekday: "long", year: "numeric", month: "long", day: "numeric",
                        })}
                    </p>
                </div>
            </div>

            {isDemo && <ErrorBanner message="Backend API unreachable or no user seeded" onRetry={refetch} />}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard title="Deep Work Hours" value={`${d.deep_work_hours}h`} icon="🧠" color="cyan" trend="up" trendValue="12% vs yesterday" />
                <MetricCard title="Identity Alignment" value={`${d.identity_alignment_avg}%`} icon="🧬" color="green" trend="up" trendValue="8.2% this week" />
                <MetricCard title="Burnout Risk" value={d.burnout_trend.toFixed(2)} icon="🛡" color="amber" trend="down" trendValue="Moderate" subtitle="stable" />
                <MetricCard title="RL Efficiency" value={`${Math.round(d.rl_strategy_efficiency * 100)}%`} icon="🤖" color="violet" trend="up" trendValue="5% improvement" />
            </div>

            {/* Energy Forecast */}
            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="section-title">Energy Forecast vs Actual</h2>
                        <p className="text-xs text-gray-500 mt-1">LSTM-predicted energy levels · Heuristic fallback active</p>
                    </div>
                    <span className="badge badge-info">Heuristic Model</span>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={energyData}>
                        <defs>
                            <linearGradient id="energyPredicted" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#5c7cfa" stopOpacity={0.3} />
                                <stop offset="100%" stopColor="#5c7cfa" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="energyActual" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.3} />
                                <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="hour" stroke="#475569" fontSize={11} tickLine={false} />
                        <YAxis domain={[0, 10]} stroke="#475569" fontSize={11} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="predicted" stroke="#5c7cfa" strokeWidth={2} fill="url(#energyPredicted)" name="Predicted" />
                        <Area type="monotone" dataKey="actual" stroke="#22d3ee" strokeWidth={2} fill="url(#energyActual)" name="Actual" connectNulls={false} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                    <h2 className="section-title mb-1">Burnout Trend · 30 Days</h2>
                    <p className="text-xs text-gray-500 mb-4">XGBoost classifier with SHAP explainability</p>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={burnoutData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="day" stroke="#475569" fontSize={10} tickLine={false} />
                            <YAxis domain={[0, 1]} stroke="#475569" fontSize={10} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="probability" stroke="#fb7185" strokeWidth={2} dot={false} name="Burnout Prob" />
                            <Line type="monotone" dataKey={() => 0.5} stroke="#475569" strokeWidth={1} strokeDasharray="5 5" dot={false} name="Threshold" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="glass-card p-6">
                    <h2 className="section-title mb-1">Burnout Feature Importance</h2>
                    <p className="text-xs text-gray-500 mb-4">SHAP-based explainability · Latest prediction</p>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={features} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                            <XAxis type="number" domain={[0, 0.4]} stroke="#475569" fontSize={10} />
                            <YAxis type="category" dataKey="name" width={120} stroke="#475569" fontSize={11} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]} name="Importance">
                                {(features || demoFeatures).map((entry: any, i: number) => (
                                    <Cell key={i} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard title="Tasks Completed" value={`${d.tasks_completed}/${d.tasks_total}`} icon="✓" color="green" />
                <MetricCard title="Decision Fatigue" value={d.decision_fatigue_index.toFixed(2)} icon="⚠" color="amber" subtitle="moderate" />
                <MetricCard title="Energy Forecast MAE" value={d.energy_forecast_mae.toFixed(1)} icon="📈" color="cyan" subtitle="good" />
                <MetricCard title="Replan Events" value="2" icon="🔄" color="rose" subtitle="today" />
            </div>
        </div>
    );
}

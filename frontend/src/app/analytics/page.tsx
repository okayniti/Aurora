"use client";

import { useUser } from "@/lib/UserContext";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import MetricCard from "@/components/layout/MetricCard";
import { ErrorBanner, DemoBadge } from "@/components/ui/Skeleton";
import {
    AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

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

const demoWeeklyDeepWork = Array.from({ length: 7 }, (_, i) => ({
    day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
    deepWork: +(2 + Math.random() * 4).toFixed(1),
    alignment: +(50 + Math.random() * 40).toFixed(0),
}));

const demoRiskTimeline = Array.from({ length: 14 }, (_, i) => ({
    day: i + 1,
    burnout: +(0.2 + Math.random() * 0.3).toFixed(2),
    fatigue: +(0.3 + Math.random() * 0.4).toFixed(2),
}));

const demoCompletion = [
    { category: "Coding", completed: 12, total: 15, color: "#5c7cfa" },
    { category: "Research", completed: 5, total: 6, color: "#34d399" },
    { category: "Writing", completed: 3, total: 5, color: "#fbbf24" },
    { category: "Meetings", completed: 8, total: 8, color: "#a78bfa" },
    { category: "DevOps", completed: 2, total: 4, color: "#fb7185" },
    { category: "Review", completed: 4, total: 5, color: "#22d3ee" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
        return (
            <div className="glass-card p-3 text-xs border border-white/10">
                <p className="text-gray-300 mb-1 font-medium">{label}</p>
                {payload.map((p: any, i: number) => (
                    <p key={i} style={{ color: p.color || p.fill }} className="font-mono">
                        {p.name}: {p.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function AnalyticsPage() {
    const { userId } = useUser();

    const { data: dashboard, error } = useApi(
        () => {
            if (!userId) throw new Error("no user");
            return api.getDashboard(userId) as any;
        },
        demoDashboard,
        [userId]
    );

    const isDemo = !!error;
    const d = dashboard || demoDashboard;

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">
                    Cognitive <span className="gradient-text">Analytics</span>
                </h1>
                {isDemo && <DemoBadge />}
            </div>
            <p className="text-gray-500 -mt-6 text-sm">System-wide metrics · Performance trends · Adaptive insights</p>

            {isDemo && <ErrorBanner message="Using simulated analytics" />}

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <MetricCard title="Deep Work" value={`${d.deep_work_hours}h`} icon="🧠" color="cyan" subtitle="today" />
                <MetricCard title="Identity Align" value={`${d.identity_alignment_avg}%`} icon="🧬" color="green" />
                <MetricCard title="Burnout Score" value={d.burnout_trend.toFixed(2)} icon="🛡" color="rose" />
                <MetricCard title="RL Efficiency" value={`${Math.round(d.rl_strategy_efficiency * 100)}%`} icon="🤖" color="violet" />
                <MetricCard title="Task Rate" value={`${d.tasks_completed}/${d.tasks_total}`} icon="📊" color="green" subtitle={`${Math.round((d.tasks_completed / Math.max(d.tasks_total, 1)) * 100)}%`} />
                <MetricCard title="Decision Fatigue" value={d.decision_fatigue_index.toFixed(2)} icon="⚡" color="amber" subtitle={d.decision_fatigue_index > 0.6 ? "high" : "moderate"} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                    <h2 className="section-title mb-1">Weekly Deep Work & Alignment</h2>
                    <p className="text-xs text-gray-500 mb-4">Hours of focused work vs identity alignment trend</p>
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={demoWeeklyDeepWork}>
                            <defs>
                                <linearGradient id="dwGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="day" stroke="#475569" fontSize={11} />
                            <YAxis yAxisId="left" domain={[0, 8]} stroke="#22d3ee" fontSize={10} />
                            <YAxis yAxisId="right" orientation="right" domain={[0, 100]} stroke="#34d399" fontSize={10} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area yAxisId="left" type="monotone" dataKey="deepWork" stroke="#22d3ee" strokeWidth={2} fill="url(#dwGrad)" name="Deep Work (h)" />
                            <Line yAxisId="right" type="monotone" dataKey="alignment" stroke="#34d399" strokeWidth={2} dot={{ r: 3 }} name="Alignment %" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="glass-card p-6">
                    <h2 className="section-title mb-1">Risk Indicators (14 Days)</h2>
                    <p className="text-xs text-gray-500 mb-4">Burnout probability and decision fatigue trends</p>
                    <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={demoRiskTimeline}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="day" stroke="#475569" fontSize={10} />
                            <YAxis domain={[0, 1]} stroke="#475569" fontSize={10} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="burnout" stroke="#fb7185" strokeWidth={2} dot={false} name="Burnout Risk" />
                            <Line type="monotone" dataKey="fatigue" stroke="#fbbf24" strokeWidth={2} dot={false} name="Decision Fatigue" />
                            <Line type="monotone" dataKey={() => 0.5} stroke="#475569" strokeDasharray="5 5" strokeWidth={1} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="glass-card p-6">
                <h2 className="section-title mb-1">Task Completion by Category</h2>
                <p className="text-xs text-gray-500 mb-6">Completed tasks vs total by work category</p>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={demoCompletion}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                        <XAxis dataKey="category" stroke="#475569" fontSize={11} />
                        <YAxis stroke="#475569" fontSize={10} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="total" fill="#1e293b" radius={[4, 4, 0, 0]} name="Total" />
                        <Bar dataKey="completed" radius={[4, 4, 0, 0]} name="Completed">
                            {demoCompletion.map((entry, i) => (
                                <Cell key={i} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

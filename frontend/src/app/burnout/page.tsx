"use client";

import MetricCard from "@/components/layout/MetricCard";
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell, PieChart, Pie,
} from "recharts";

const burnoutTrend = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    probability: +(0.15 + Math.sin(i / 5) * 0.15 + Math.random() * 0.12).toFixed(3),
}));

const featureData = [
    { name: "Stress Trend", value: 0.32, color: "#fb7185" },
    { name: "Sleep Quality", value: 0.25, color: "#5c7cfa" },
    { name: "Cognitive Load", value: 0.20, color: "#fbbf24" },
    { name: "Deep Work Streak", value: 0.13, color: "#34d399" },
    { name: "Energy Variance", value: 0.10, color: "#a78bfa" },
];

const riskDistribution = [
    { name: "Low", value: 12, fill: "#34d399" },
    { name: "Moderate", value: 10, fill: "#fbbf24" },
    { name: "High", value: 6, fill: "#fb7185" },
    { name: "Critical", value: 2, fill: "#ef4444" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
        return (
            <div className="glass-card p-3 text-xs border border-white/10">
                <p className="text-gray-300 mb-1 font-medium">{label ? `Day ${label}` : payload[0]?.name}</p>
                {payload.map((p: any, i: number) => (
                    <p key={i} style={{ color: p.fill || p.color }} className="font-mono">
                        {p.name}: {typeof p.value === "number" ? p.value.toFixed(3) : p.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function BurnoutPage() {
    const latest = burnoutTrend[burnoutTrend.length - 1].probability;
    const riskLevel = latest < 0.25 ? "Low" : latest < 0.5 ? "Moderate" : latest < 0.75 ? "High" : "Critical";
    const riskColor = latest < 0.25 ? "green" : latest < 0.5 ? "amber" : "rose";

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Burnout <span className="gradient-text">Monitor</span>
                </h1>
                <p className="text-gray-500 mt-1 text-sm">
                    XGBoost classifier · SHAP explainability · Real-time risk monitoring
                </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard title="Burnout Risk" value={latest.toFixed(3)} icon="🛡" color={riskColor as any} subtitle={riskLevel} />
                <MetricCard title="Sleep Trend" value="6.8h" icon="😴" color="cyan" subtitle="below optimal" />
                <MetricCard title="Deep Work Streak" value="3.5h" icon="🧠" color="violet" trend="up" trendValue="today" />
                <MetricCard title="Cognitive Load" value="14.2" icon="⚡" color="amber" subtitle="elevated" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                    <h2 className="section-title mb-1">30-Day Burnout Trend</h2>
                    <p className="text-xs text-gray-500 mb-4">Burnout probability over time · Threshold at 0.5</p>
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={burnoutTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="day" stroke="#475569" fontSize={10} />
                            <YAxis domain={[0, 1]} stroke="#475569" fontSize={10} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="probability" stroke="#fb7185" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey={() => 0.5} stroke="#475569" strokeDasharray="5 5" dot={false} strokeWidth={1} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="glass-card p-6">
                    <h2 className="section-title mb-1">Feature Importance (SHAP)</h2>
                    <p className="text-xs text-gray-500 mb-4">Explainable contribution to burnout prediction</p>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={featureData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                            <XAxis type="number" domain={[0, 0.4]} stroke="#475569" fontSize={10} />
                            <YAxis type="category" dataKey="name" width={120} stroke="#475569" fontSize={11} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="value" radius={[0, 6, 6, 0]} name="SHAP Value">
                                {featureData.map((entry, i) => (
                                    <Cell key={i} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="glass-card p-6">
                <h2 className="section-title mb-1">Risk Level Distribution (Past 30 Days)</h2>
                <p className="text-xs text-gray-500 mb-4">Count of days at each risk level</p>
                <div className="flex items-center gap-8">
                    <ResponsiveContainer width="40%" height={200}>
                        <PieChart>
                            <Pie data={riskDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                                {riskDistribution.map((entry, i) => (
                                    <Cell key={i} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-3">
                        {riskDistribution.map((item) => (
                            <div key={item.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                                    <span className="text-sm text-gray-300">{item.name}</span>
                                </div>
                                <span className="font-mono text-sm text-gray-400">{item.value} days</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

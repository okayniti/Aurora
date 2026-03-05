"use client";

import MetricCard from "@/components/layout/MetricCard";
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, ComposedChart, Area,
} from "recharts";

const dailyMetrics = Array.from({ length: 14 }, (_, i) => ({
    day: `Day ${i + 1}`,
    deepWork: +(2 + Math.random() * 4).toFixed(1),
    alignment: +(50 + Math.random() * 35).toFixed(1),
    burnout: +(0.15 + Math.random() * 0.4).toFixed(3),
    fatigue: +(0.2 + Math.random() * 0.5).toFixed(3),
    efficiency: +(0.5 + Math.random() * 0.4).toFixed(3),
    completed: Math.floor(3 + Math.random() * 7),
    total: Math.floor(6 + Math.random() * 5),
}));

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
        return (
            <div className="glass-card p-3 text-xs border border-white/10">
                <p className="text-gray-300 mb-1 font-medium">{label}</p>
                {payload.map((p: any, i: number) => (
                    <p key={i} style={{ color: p.color || p.stroke }} className="font-mono">
                        {p.name}: {p.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function AnalyticsPage() {
    const latest = dailyMetrics[dailyMetrics.length - 1];

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Cognitive <span className="gradient-text">Analytics</span>
                </h1>
                <p className="text-gray-500 mt-1 text-sm">
                    Comprehensive performance intelligence · Multi-dimensional tracking
                </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <MetricCard title="Deep Work" value={`${latest.deepWork}h`} icon="🧠" color="cyan" />
                <MetricCard title="Alignment" value={`${latest.alignment}%`} icon="🧬" color="green" />
                <MetricCard title="Burnout" value={latest.burnout} icon="🛡" color="amber" />
                <MetricCard title="Fatigue Index" value={latest.fatigue} icon="⚠" color="rose" />
                <MetricCard title="RL Efficiency" value={`${(+latest.efficiency * 100).toFixed(0)}%`} icon="🤖" color="violet" />
                <MetricCard title="Tasks" value={`${latest.completed}/${latest.total}`} icon="✓" color="default" />
            </div>

            {/* Deep Work + Alignment Trend */}
            <div className="glass-card p-6">
                <h2 className="section-title mb-1">Deep Work & Alignment Trends</h2>
                <p className="text-xs text-gray-500 mb-6">14-day rolling view</p>
                <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={dailyMetrics}>
                        <defs>
                            <linearGradient id="deepWorkGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.3} />
                                <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="day" stroke="#475569" fontSize={10} />
                        <YAxis yAxisId="left" domain={[0, 8]} stroke="#475569" fontSize={10} />
                        <YAxis yAxisId="right" orientation="right" domain={[0, 100]} stroke="#475569" fontSize={10} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area yAxisId="left" type="monotone" dataKey="deepWork" fill="url(#deepWorkGrad)" stroke="#22d3ee" strokeWidth={2} name="Deep Work (h)" />
                        <Line yAxisId="right" type="monotone" dataKey="alignment" stroke="#34d399" strokeWidth={2} dot={false} name="Alignment %" />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Burnout vs Fatigue */}
                <div className="glass-card p-6">
                    <h2 className="section-title mb-1">Risk Indicators</h2>
                    <p className="text-xs text-gray-500 mb-4">Burnout probability & decision fatigue index</p>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={dailyMetrics}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="day" stroke="#475569" fontSize={10} />
                            <YAxis domain={[0, 1]} stroke="#475569" fontSize={10} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="burnout" stroke="#fb7185" strokeWidth={2} dot={false} name="Burnout" />
                            <Line type="monotone" dataKey="fatigue" stroke="#fbbf24" strokeWidth={2} dot={false} name="Fatigue" />
                            <Line type="monotone" dataKey={() => 0.5} stroke="#475569" strokeDasharray="5 5" dot={false} strokeWidth={1} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Task Completion */}
                <div className="glass-card p-6">
                    <h2 className="section-title mb-1">Task Completion Rate</h2>
                    <p className="text-xs text-gray-500 mb-4">Daily completed vs total tasks</p>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={dailyMetrics}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="day" stroke="#475569" fontSize={10} />
                            <YAxis stroke="#475569" fontSize={10} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="total" fill="#1e293b" radius={[4, 4, 0, 0]} name="Total" />
                            <Bar dataKey="completed" fill="#5c7cfa" radius={[4, 4, 0, 0]} name="Completed" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

"use client";

import MetricCard from "@/components/layout/MetricCard";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, LineChart, Line,
} from "recharts";

const hourlyData = Array.from({ length: 24 }, (_, i) => {
    const base = [3, 2.5, 2, 1.5, 1, 1.5, 3, 5, 7, 8, 8.5, 8, 7, 6, 5.5, 6.5, 7, 7.5, 7, 6.5, 6, 5, 4, 3.5];
    const predicted = +(base[i] + (Math.random() - 0.5) * 0.5).toFixed(1);
    const actual = i < new Date().getHours() ? +(base[i] + (Math.random() - 0.5) * 1.5).toFixed(1) : null;
    return { hour: `${String(i).padStart(2, "0")}:00`, predicted, actual };
});

const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return {
        day: days[i],
        avgEnergy: +(5 + Math.random() * 3).toFixed(1),
        peakEnergy: +(7 + Math.random() * 2.5).toFixed(1),
        lowEnergy: +(2 + Math.random() * 2).toFixed(1),
    };
});

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

export default function EnergyPage() {
    const currentHour = new Date().getHours();
    const currentEnergy = hourlyData[currentHour]?.actual || hourlyData[currentHour]?.predicted || 0;
    const peakHour = hourlyData.reduce((max, d) => d.predicted > max.predicted ? d : max, hourlyData[0]);

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Energy <span className="gradient-text">Forecasting</span>
                </h1>
                <p className="text-gray-500 mt-1 text-sm">
                    LSTM-based cognitive energy prediction · Time-series modeling
                </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard title="Current Energy" value={currentEnergy.toFixed(1)} icon="⚡" color="cyan" subtitle="/10" />
                <MetricCard title="Peak Hour" value={peakHour.hour} icon="📈" color="green" subtitle={`${peakHour.predicted}/10`} />
                <MetricCard title="Model Type" value="Heuristic" icon="🧪" color="violet" subtitle="LSTM pending" />
                <MetricCard title="Forecast MAE" value="0.82" icon="📊" color="amber" subtitle="good accuracy" />
            </div>

            <div className="glass-card p-6">
                <h2 className="section-title mb-1">24-Hour Energy Forecast</h2>
                <p className="text-xs text-gray-500 mb-6">Predicted vs actual · Circadian rhythm + behavioral modifiers</p>
                <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={hourlyData}>
                        <defs>
                            <linearGradient id="epred" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#5c7cfa" stopOpacity={0.4} />
                                <stop offset="100%" stopColor="#5c7cfa" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="eact" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.4} />
                                <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="hour" stroke="#475569" fontSize={10} tickLine={false} />
                        <YAxis domain={[0, 10]} stroke="#475569" fontSize={10} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="predicted" stroke="#5c7cfa" strokeWidth={2} fill="url(#epred)" name="Predicted" />
                        <Area type="monotone" dataKey="actual" stroke="#22d3ee" strokeWidth={2} fill="url(#eact)" name="Actual" connectNulls={false} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="glass-card p-6">
                <h2 className="section-title mb-1">Weekly Energy Trends</h2>
                <p className="text-xs text-gray-500 mb-6">Average, peak, and low energy levels by day</p>
                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="day" stroke="#475569" fontSize={11} />
                        <YAxis domain={[0, 10]} stroke="#475569" fontSize={10} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="peakEnergy" stroke="#34d399" strokeWidth={2} dot={{ r: 3 }} name="Peak" />
                        <Line type="monotone" dataKey="avgEnergy" stroke="#5c7cfa" strokeWidth={2} dot={{ r: 3 }} name="Average" />
                        <Line type="monotone" dataKey="lowEnergy" stroke="#fb7185" strokeWidth={2} dot={{ r: 3 }} name="Low" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

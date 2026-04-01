"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
        return (
            <div className="glass-panel p-3 text-xs border border-outline rounded-lg">
                <p className="text-on-surface mb-1 font-medium">{label}</p>
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

export default function AnalyticsRiskChart({ data }: { data: any }) {
    return (
        <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1f26" />
                <XAxis dataKey="day" stroke="#44484e" fontSize={10} />
                <YAxis domain={[0, 1]} stroke="#44484e" fontSize={10} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="burnout" stroke="#ff6e84" strokeWidth={2} dot={false} name="Burnout Risk" />
                <Line type="monotone" dataKey="fatigue" stroke="#fbbf24" strokeWidth={2} dot={false} name="Decision Fatigue" />
                <Line type="monotone" dataKey={() => 0.5} stroke="#44484e" strokeDasharray="5 5" strokeWidth={1} dot={false} />
            </LineChart>
        </ResponsiveContainer>
    );
}

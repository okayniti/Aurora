"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
        return (
            <div className="glass-panel p-3 text-xs border border-outline rounded-lg">
                <p className="text-on-surface mb-1 font-medium">{label}</p>
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

export default function EnergyWeeklyChart({ data }: { data: any }) {
    return (
        <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1f26" />
                <XAxis dataKey="day" stroke="#44484e" fontSize={11} />
                <YAxis domain={[0, 10]} stroke="#44484e" fontSize={10} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="peakEnergy" stroke="#34d399" strokeWidth={2} dot={{ r: 3 }} name="Peak" />
                <Line type="monotone" dataKey="avgEnergy" stroke="#9093ff" strokeWidth={2} dot={{ r: 3 }} name="Average" />
                <Line type="monotone" dataKey="lowEnergy" stroke="#ff6e84" strokeWidth={2} dot={{ r: 3 }} name="Low" />
            </LineChart>
        </ResponsiveContainer>
    );
}

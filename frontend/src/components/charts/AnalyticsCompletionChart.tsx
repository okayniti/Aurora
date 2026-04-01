"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

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

export default function AnalyticsCompletionChart({ data }: { data: any }) {
    return (
        <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1f26" horizontal={false} />
                <XAxis dataKey="category" stroke="#44484e" fontSize={11} />
                <YAxis stroke="#44484e" fontSize={10} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" fill="#1a1f26" radius={[4, 4, 0, 0]} name="Total" />
                <Bar dataKey="completed" radius={[4, 4, 0, 0]} name="Completed">
                    {data.map((entry: any, i: number) => (
                        <Cell key={i} fill={entry.color} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}

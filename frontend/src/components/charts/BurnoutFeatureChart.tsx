"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
        return (
            <div className="glass-panel p-3 text-xs border border-outline rounded-lg">
                <p className="text-on-surface mb-1 font-medium">{label}</p>
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

export default function BurnoutFeatureChart({ data, demoFeatures }: { data: any, demoFeatures: any[] }) {
    return (
        <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1f26" horizontal={false} />
                <XAxis type="number" domain={[0, 0.4]} stroke="#44484e" fontSize={10} />
                <YAxis type="category" dataKey="name" width={120} stroke="#44484e" fontSize={11} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} name="SHAP Value">
                    {(data || demoFeatures).map((entry: any, i: number) => (
                        <Cell key={i} fill={entry.color} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}

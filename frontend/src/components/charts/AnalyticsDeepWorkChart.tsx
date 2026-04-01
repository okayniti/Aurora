"use client";

import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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

export default function AnalyticsDeepWorkChart({ data }: { data: any }) {
    return (
        <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data}>
                <defs>
                    <linearGradient id="dwGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3adffa" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#3adffa" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1f26" />
                <XAxis dataKey="day" stroke="#44484e" fontSize={11} />
                <YAxis yAxisId="left" domain={[0, 8]} stroke="#3adffa" fontSize={10} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} stroke="#34d399" fontSize={10} />
                <Tooltip content={<CustomTooltip />} />
                <Area yAxisId="left" type="monotone" dataKey="deepWork" stroke="#3adffa" strokeWidth={2} fill="url(#dwGrad)" name="Deep Work (h)" />
                <Line yAxisId="right" type="monotone" dataKey="alignment" stroke="#34d399" strokeWidth={2} dot={{ r: 3 }} name="Alignment %" />
            </AreaChart>
        </ResponsiveContainer>
    );
}

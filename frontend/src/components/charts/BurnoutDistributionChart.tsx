"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

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

export default function BurnoutDistributionChart({ data }: { data: any }) {
    return (
        <ResponsiveContainer width="40%" height={200}>
            <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {data.map((entry: any, i: number) => (
                        <Cell key={i} fill={entry.fill} />
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
            </PieChart>
        </ResponsiveContainer>
    );
}

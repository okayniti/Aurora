"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
        return (
            <div className="glass-panel p-3 text-xs border border-outline rounded-lg">
                <p className="text-on-surface font-medium">{payload[0]?.payload?.task}</p>
                <p className="text-primary font-mono mt-1">Alignment: {payload[0]?.value}%</p>
            </div>
        );
    }
    return null;
};

export default function IdentityAlignmentChart({ data }: { data: any }) {
    return (
        <ResponsiveContainer width="100%" height={380}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1f26" horizontal={false} />
                <XAxis dataKey="task" stroke="#44484e" fontSize={9} angle={-20} textAnchor="end" height={70} interval={0} />
                <YAxis domain={[0, 100]} stroke="#44484e" fontSize={10} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="score" radius={[4, 4, 0, 0]} name="Alignment %">
                    {data.map((entry: any, i: number) => (
                        <Cell key={i} fill={entry.color} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}

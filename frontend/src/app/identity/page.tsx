"use client";

import MetricCard from "@/components/layout/MetricCard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const alignmentData = [
    { task: "Implement LSTM Model", score: 92, category: "coding" },
    { task: "Research Transformers", score: 88, category: "research" },
    { task: "Optimize DB Queries", score: 76, category: "coding" },
    { task: "Write System Design Doc", score: 71, category: "writing" },
    { task: "Review PR #42", score: 63, category: "review" },
    { task: "Update README", score: 55, category: "writing" },
    { task: "Deploy Staging Build", score: 48, category: "devops" },
    { task: "Read RL Paper", score: 85, category: "research" },
    { task: "Team Standup", score: 32, category: "meetings" },
    { task: "Fix DB Migration", score: 58, category: "coding" },
];

const getAlignmentColor = (score: number) => {
    if (score >= 80) return "#34d399";
    if (score >= 60) return "#5c7cfa";
    if (score >= 40) return "#fbbf24";
    return "#fb7185";
};

const getInterpretation = (score: number) => {
    if (score >= 80) return "Strongly Aligned";
    if (score >= 60) return "Well Aligned";
    if (score >= 40) return "Moderately Aligned";
    return "Weakly Aligned";
};

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
        const data = payload[0].payload;
        return (
            <div className="glass-card p-3 text-xs border border-white/10">
                <p className="text-gray-200 font-medium mb-1">{data.task}</p>
                <p className="font-mono" style={{ color: getAlignmentColor(data.score) }}>
                    Alignment: {data.score}%
                </p>
                <p className="text-gray-500 mt-1">{getInterpretation(data.score)}</p>
            </div>
        );
    }
    return null;
};

export default function IdentityPage() {
    const avgAlignment = (alignmentData.reduce((sum, d) => sum + d.score, 0) / alignmentData.length).toFixed(1);
    const stronglyAligned = alignmentData.filter(d => d.score >= 80).length;

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Identity <span className="gradient-text">Alignment</span>
                </h1>
                <p className="text-gray-500 mt-1 text-sm">
                    Sentence-transformer embeddings · Cosine similarity scoring · Task-identity mapping
                </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard title="Avg Alignment" value={`${avgAlignment}%`} icon="🧬" color="green" />
                <MetricCard title="Strongly Aligned" value={`${stronglyAligned}/${alignmentData.length}`} icon="✓" color="cyan" />
                <MetricCard title="Embedding Model" value="MiniLM" icon="🤖" color="violet" subtitle="384-dim" />
                <MetricCard title="Identity Set" value="Yes" icon="🪪" color="amber" subtitle="active" />
            </div>

            {/* Identity Description */}
            <div className="glass-card p-6">
                <h2 className="section-title mb-3">Identity Profile</h2>
                <div className="bg-surface-400/50 rounded-xl p-4 border border-white/5">
                    <p className="text-sm text-gray-300 leading-relaxed italic">
                        &ldquo;I am a disciplined machine learning engineer who values deep work, continuous learning,
                        and building impactful AI systems. I prioritize research, code quality, and long-term career
                        growth over short-term gains.&rdquo;
                    </p>
                    <p className="text-[10px] text-gray-600 mt-2 font-mono">Embedded → 384-dimensional vector → cached</p>
                </div>
            </div>

            {/* Alignment Chart */}
            <div className="glass-card p-6">
                <h2 className="section-title mb-1">Task Alignment Scores</h2>
                <p className="text-xs text-gray-500 mb-6">Cosine similarity × 125 → alignment percentage</p>
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={alignmentData.sort((a, b) => b.score - a.score)} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                        <XAxis type="number" domain={[0, 100]} stroke="#475569" fontSize={10} />
                        <YAxis type="category" dataKey="task" width={180} stroke="#475569" fontSize={11} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="score" radius={[0, 6, 6, 0]} name="Alignment %">
                            {alignmentData.sort((a, b) => b.score - a.score).map((entry, i) => (
                                <Cell key={i} fill={getAlignmentColor(entry.score)} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex gap-6 justify-center">
                {[
                    { label: "Strongly Aligned (80+)", color: "#34d399" },
                    { label: "Well Aligned (60-79)", color: "#5c7cfa" },
                    { label: "Moderate (40-59)", color: "#fbbf24" },
                    { label: "Weak (<40)", color: "#fb7185" },
                ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-xs text-gray-400">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

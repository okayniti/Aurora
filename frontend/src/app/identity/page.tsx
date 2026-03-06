"use client";

import { useState } from "react";
import { useUser } from "@/lib/UserContext";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import MetricCard from "@/components/layout/MetricCard";
import { ErrorBanner, DemoBadge } from "@/components/ui/Skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const demoAlignments = [
    { task: "Implement LSTM Energy Model", score: 92, color: "#34d399" },
    { task: "Research Transformer Architectures", score: 88, color: "#34d399" },
    { task: "Write System Design Doc", score: 76, color: "#5c7cfa" },
    { task: "Optimize Database Queries", score: 71, color: "#5c7cfa" },
    { task: "Read RL Scheduling Paper", score: 85, color: "#34d399" },
    { task: "Fix Database Migration", score: 63, color: "#fbbf24" },
    { task: "Update README Documentation", score: 45, color: "#fbbf24" },
    { task: "Deploy Staging Build", score: 38, color: "#fb7185" },
    { task: "Team Standup Meeting", score: 25, color: "#fb7185" },
    { task: "Review PR #42", score: 52, color: "#fbbf24" },
];

const demoIdentity = `I am a disciplined machine learning engineer who values deep work, continuous learning, and building impactful AI systems. I prioritize research, code quality, and long-term career growth over short-term gains.`;

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
        return (
            <div className="glass-card p-3 text-xs border border-white/10">
                <p className="text-gray-300 font-medium">{payload[0]?.payload?.task}</p>
                <p className="text-aurora-400 font-mono mt-1">Alignment: {payload[0]?.value}%</p>
            </div>
        );
    }
    return null;
};

export default function IdentityPage() {
    const { userId } = useUser();
    const [identityText, setIdentityText] = useState(demoIdentity);

    const { data: alignments, error, refetch } = useApi(
        async () => {
            if (!userId) throw new Error("no user");
            const scores: any = await api.getAlignmentScores(userId);
            if (!Array.isArray(scores) || scores.length === 0) return demoAlignments;
            return scores.map((s: any) => ({
                task: s.task_description?.slice(0, 40) || "Task",
                score: Math.round(s.alignment_score * 100),
                color: s.alignment_score > 0.7 ? "#34d399" : s.alignment_score > 0.4 ? "#fbbf24" : "#fb7185",
            }));
        },
        demoAlignments,
        [userId]
    );

    const isDemo = !!error;
    const avgAlignment = (alignments || demoAlignments).reduce((sum: number, a: any) => sum + a.score, 0) / (alignments || demoAlignments).length;
    const highlyAligned = (alignments || demoAlignments).filter((a: any) => a.score >= 70).length;

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">
                    Identity <span className="gradient-text">Alignment</span>
                </h1>
                {isDemo && <DemoBadge />}
            </div>
            <p className="text-gray-500 -mt-6 text-sm">Sentence-Transformer embeddings · Cosine similarity · Semantic task matching</p>

            {isDemo && <ErrorBanner message="Using simulated alignment data" />}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard title="Avg Alignment" value={`${avgAlignment.toFixed(1)}%`} icon="🧬" color="green" />
                <MetricCard title="Highly Aligned" value={`${highlyAligned}/${(alignments || demoAlignments).length}`} icon="✓" color="cyan" subtitle="≥70% match" />
                <MetricCard title="Embedding Model" value="MiniLM" icon="🧠" color="violet" subtitle="384 dims" />
                <MetricCard title="Method" value="Cosine" icon="📐" color="amber" subtitle="similarity" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-card p-6">
                    <h2 className="section-title mb-1">Task-Identity Alignment Scores</h2>
                    <p className="text-xs text-gray-500 mb-6">Cosine similarity between task embeddings and identity embedding</p>
                    <ResponsiveContainer width="100%" height={380}>
                        <BarChart data={(alignments || demoAlignments).sort((a: any, b: any) => b.score - a.score)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                            <XAxis dataKey="task" stroke="#475569" fontSize={9} angle={-20} textAnchor="end" height={70} interval={0} />
                            <YAxis domain={[0, 100]} stroke="#475569" fontSize={10} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="score" radius={[4, 4, 0, 0]} name="Alignment %">
                                {(alignments || demoAlignments).sort((a: any, b: any) => b.score - a.score).map((entry: any, i: number) => (
                                    <Cell key={i} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="glass-card p-6">
                    <h2 className="section-title mb-4">Identity Profile</h2>
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-surface-400/40 border border-white/5">
                            <p className="text-xs text-gray-500 mb-2">Your Identity Description</p>
                            <textarea
                                value={identityText}
                                onChange={(e) => setIdentityText(e.target.value)}
                                className="w-full bg-transparent text-sm text-gray-300 leading-relaxed resize-none outline-none min-h-[120px]"
                            />
                        </div>
                        <button
                            onClick={async () => {
                                if (userId) {
                                    try {
                                        await api.updateIdentity(userId, identityText);
                                        refetch();
                                    } catch { }
                                }
                            }}
                            className="w-full px-4 py-2.5 rounded-xl bg-aurora-700/20 border border-aurora-700/30 text-aurora-400 text-sm font-medium hover:bg-aurora-700/30 transition-colors"
                        >
                            Update Identity & Re-align
                        </button>
                        <div className="space-y-2 mt-4">
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Alignment Guide</p>
                            <div className="flex items-center gap-2 text-xs">
                                <div className="w-3 h-3 rounded-full bg-emerald-500" /><span className="text-gray-400">≥70% — Highly aligned</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                <div className="w-3 h-3 rounded-full bg-amber-500" /><span className="text-gray-400">40–70% — Moderate</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                <div className="w-3 h-3 rounded-full bg-rose-500" /><span className="text-gray-400">&lt;40% — Low alignment</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

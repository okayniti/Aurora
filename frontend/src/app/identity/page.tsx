"use client";

import { useState } from "react";
import { useUser } from "@/lib/UserContext";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import MetricCard from "@/components/layout/MetricCard";
import { ErrorBanner, DemoBadge } from "@/components/ui/Skeleton";
import { BackgroundBeams } from "@/components/ui/BackgroundBeams";
import dynamic from "next/dynamic";
import { ChartSkeleton } from "@/components/ui/Skeleton";

const IdentityAlignmentChart = dynamic(() => import("@/components/charts/IdentityAlignmentChart"), {
    ssr: false,
    loading: () => <ChartSkeleton height="h-[380px]" />
});

const demoAlignments = [
    { task: "Implement LSTM Energy Model", score: 92, color: "#34d399" },
    { task: "Research Transformer Architectures", score: 88, color: "#34d399" },
    { task: "Write System Design Doc", score: 76, color: "#9093ff" },
    { task: "Optimize Database Queries", score: 71, color: "#9093ff" },
    { task: "Read RL Scheduling Paper", score: 85, color: "#34d399" },
    { task: "Fix Database Migration", score: 63, color: "#fbbf24" },
    { task: "Update README Documentation", score: 45, color: "#fbbf24" },
    { task: "Deploy Staging Build", score: 38, color: "#ff6e84" },
    { task: "Team Standup Meeting", score: 25, color: "#ff6e84" },
    { task: "Review PR #42", score: 52, color: "#fbbf24" },
];

const demoIdentity = `I am a disciplined machine learning engineer who values deep work, continuous learning, and building impactful AI systems. I prioritize research, code quality, and long-term career growth over short-term gains.`;

// CustomTooltip moved
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
                color: s.alignment_score > 0.7 ? "#34d399" : s.alignment_score > 0.4 ? "#fbbf24" : "#ff6e84",
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
                <h1 className="text-3xl font-bold tracking-tight text-on-surface">
                    Identity <span className="gradient-text">Alignment</span>
                </h1>
                {isDemo && <DemoBadge />}
            </div>
            <p className="text-on-surface-variant -mt-6 text-sm">Sentence-Transformer embeddings · Cosine similarity · Semantic task matching</p>

            {isDemo && <ErrorBanner message="Using simulated alignment data" />}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard title="Avg Alignment" value={`${avgAlignment.toFixed(1)}%`} icon="🧬" color="green" />
                <MetricCard title="Highly Aligned" value={`${highlyAligned}/${(alignments || demoAlignments).length}`} icon="✓" color="cyan" subtitle="≥70% match" />
                <MetricCard title="Embedding Model" value="MiniLM" icon="🧠" color="violet" subtitle="384 dims" />
                <MetricCard title="Method" value="Cosine" icon="📐" color="amber" subtitle="similarity" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-panel p-6 rounded-xl border border-white/5 relative overflow-hidden">
                    <BackgroundBeams />
                    <h2 className="section-title mb-1">Task-Identity Alignment Scores</h2>
                    <p className="text-xs text-on-surface-variant mb-6">Cosine similarity between task embeddings and identity embedding</p>
                    <IdentityAlignmentChart data={(alignments || demoAlignments).sort((a: any, b: any) => b.score - a.score)} />
                </div>

                <div className="glass-panel p-6 rounded-xl border border-white/5">
                    <h2 className="section-title mb-4">Identity Profile</h2>
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-surface-container-low border border-white/5">
                            <p className="text-xs text-on-surface-variant mb-2">Your Identity Description</p>
                            <textarea
                                value={identityText}
                                onChange={(e) => setIdentityText(e.target.value)}
                                className="w-full bg-transparent text-sm text-on-surface leading-relaxed resize-none outline-none min-h-[120px]"
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
                            className="w-full px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
                        >
                            Update Identity & Re-align
                        </button>
                        <div className="space-y-2 mt-4">
                            <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">Alignment Guide</p>
                            <div className="flex items-center gap-2 text-xs">
                                <div className="w-3 h-3 rounded-full bg-emerald-500" /><span className="text-on-surface-variant">≥70% — Highly aligned</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                <div className="w-3 h-3 rounded-full bg-amber-500" /><span className="text-on-surface-variant">40–70% — Moderate</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                <div className="w-3 h-3 rounded-full bg-error" /><span className="text-on-surface-variant">&lt;40% — Low alignment</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

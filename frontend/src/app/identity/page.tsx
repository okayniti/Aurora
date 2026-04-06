"use client";

import { useState } from "react";
import { useUser } from "@/lib/UserContext";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import MetricCard from "@/components/layout/MetricCard";
import { ErrorBanner, DemoBadge, ChartSkeleton, MetricSkeleton } from "@/components/ui/Skeleton";
import { BackgroundBeams } from "@/components/ui/BackgroundBeams";
import dynamic from "next/dynamic";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

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

    const { data: alignments, error, refetch, loading } = useApi(
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
                    Identity
                </h1>
                {isDemo && <DemoBadge />}
            </div>

            {isDemo && <ErrorBanner message="Using simulated alignment data" />}

            {loading && (!alignments || alignments.length === 0) ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:row-span-2"><MetricSkeleton /></div>
                    <div className="lg:col-span-2"><ChartSkeleton height="h-[380px]" /></div>
                    <div className="lg:col-span-2"><MetricSkeleton /></div>
                </div>
            ) : !isDemo && (!alignments || alignments.length === 0) ? (
                <ScrollReveal className="glass-panel p-12 text-center rounded-xl border border-white/5 flex flex-col items-center gap-4">
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 animate-pulse">fingerprint</span>
                    <h3 className="text-lg font-medium text-on-surface">No profile</h3>
                    <p className="text-sm text-on-surface-variant">Write your identity profile to begin alignment scoring.</p>
                </ScrollReveal>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Who am I */}
                <ScrollReveal index={0} className="glass-panel p-6 rounded-xl border border-white/5 flex flex-col lg:row-span-2">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-xl">👤</span>
                        <span className="text-sm font-medium text-on-surface-variant">Who am I</span>
                    </div>
                    <textarea
                        value={identityText}
                        onChange={(e) => setIdentityText(e.target.value)}
                        className="w-full flex-1 bg-surface-container rounded-xl p-4 text-sm text-on-surface leading-relaxed resize-none outline-none focus:border-primary border border-outline min-h-[200px] mb-4"
                    />
                    <button
                        onClick={async () => {
                            if (userId) {
                                try {
                                    await api.updateIdentity(userId, identityText);
                                    refetch();
                                } catch { }
                            }
                        }}
                        className="w-full py-3 rounded-xl bg-primary hover:bg-primary-dim text-on-primary text-sm font-bold transition-all outline-none active:scale-95 shadow-glow"
                    >
                        Update Identity
                    </button>
                </ScrollReveal>

                {/* Mission Map Chart */}
                <ScrollReveal index={1} className="glass-panel p-6 rounded-xl border border-white/5 lg:col-span-2 flex flex-col relative overflow-hidden text-left min-h-[350px]">
                    <BackgroundBeams />
                    <div className="flex items-center gap-2 mb-4 relative z-10">
                        <span className="text-xl">🗺️</span>
                        <span className="text-sm font-medium text-on-surface-variant">My Mission Map</span>
                    </div>
                    <div className="flex-1 min-h-[200px] relative z-10">
                        <IdentityAlignmentChart data={(alignments || demoAlignments).sort((a: any, b: any) => b.score - a.score)} />
                    </div>
                </ScrollReveal>

                {/* Alignment Stats */}
                <ScrollReveal index={2} className="glass-panel p-6 rounded-xl border border-white/5 lg:col-span-2 flex justify-around items-center text-center">
                    <div>
                        <span className="text-3xl mb-1 block">🧬</span>
                        <h3 className="text-sm font-bold text-on-surface-variant">Model Match</h3>
                    </div>
                    <div>
                        <div className="text-4xl font-bold tracking-tighter text-emerald-400">{avgAlignment.toFixed(0)}%</div>
                        <span className="text-[10px] uppercase tracking-wider text-on-surface-variant">Average</span>
                    </div>
                    <div>
                        <div className="text-4xl font-bold tracking-tighter text-cyan-400">{highlyAligned}</div>
                        <span className="text-[10px] uppercase tracking-wider text-on-surface-variant">Aligned Tasks</span>
                    </div>
                </ScrollReveal>

            </div>
            )}
        </div>
    );
}

"use client";

import { useUser } from "@/lib/UserContext";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import MetricCard from "@/components/layout/MetricCard";
import { ErrorBanner, DemoBadge, ChartSkeleton, MetricSkeleton } from "@/components/ui/Skeleton";
import dynamic from "next/dynamic";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const AnalyticsDeepWorkChart = dynamic(() => import("@/components/charts/AnalyticsDeepWorkChart"), {
    ssr: false,
    loading: () => <ChartSkeleton height="h-[260px]" />
});

const AnalyticsRiskChart = dynamic(() => import("@/components/charts/AnalyticsRiskChart"), {
    ssr: false,
    loading: () => <ChartSkeleton height="h-[260px]" />
});

const AnalyticsCompletionChart = dynamic(() => import("@/components/charts/AnalyticsCompletionChart"), {
    ssr: false,
    loading: () => <ChartSkeleton height="h-[250px]" />
});

const demoDashboard = {
    deep_work_hours: 4.2,
    identity_alignment_avg: 73.5,
    burnout_trend: 0.34,
    rl_strategy_efficiency: 0.82,
    energy_forecast_mae: 0.8,
    decision_fatigue_index: 0.42,
    tasks_completed: 6,
    tasks_total: 10,
};

const demoWeeklyDeepWork = Array.from({ length: 7 }, (_, i) => ({
    day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
    deepWork: +(2 + Math.random() * 4).toFixed(1),
    alignment: +(50 + Math.random() * 40).toFixed(0),
}));

const demoRiskTimeline = Array.from({ length: 14 }, (_, i) => ({
    day: i + 1,
    burnout: +(0.2 + Math.random() * 0.3).toFixed(2),
    fatigue: +(0.3 + Math.random() * 0.4).toFixed(2),
}));

const demoCompletion = [
    { category: "Coding", completed: 12, total: 15, color: "#9093ff" },
    { category: "Research", completed: 5, total: 6, color: "#34d399" },
    { category: "Writing", completed: 3, total: 5, color: "#fbbf24" },
    { category: "Meetings", completed: 8, total: 8, color: "#cc97ff" },
    { category: "DevOps", completed: 2, total: 4, color: "#ff6e84" },
    { category: "Review", completed: 4, total: 5, color: "#3adffa" },
];

// CustomTooltip moved

export default function AnalyticsPage() {
    const { userId } = useUser();

    const { data: dashboard, error, loading } = useApi(
        () => {
            if (!userId) throw new Error("no user");
            return api.getDashboard(userId) as any;
        },
        demoDashboard,
        [userId]
    );

    const isDemo = !!error;
    const d = dashboard || demoDashboard;

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-on-surface">
                    Cognitive Analytics
                </h1>
                {isDemo && <DemoBadge />}
            </div>

            {isDemo && <ErrorBanner message="Using simulated analytics" />}

            {loading && !dashboard ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:row-span-2"><MetricSkeleton /></div>
                    <div className="lg:col-span-2"><ChartSkeleton height="h-[260px]" /></div>
                    <div className="lg:col-span-2"><ChartSkeleton height="h-[260px]" /></div>
                    <div className="lg:col-span-3"><ChartSkeleton height="h-[250px]" /></div>
                </div>
            ) : !isDemo && !dashboard ? (
                <ScrollReveal className="glass-panel p-12 text-center rounded-xl border border-white/5 flex flex-col items-center gap-4">
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 animate-pulse">analytics</span>
                    <h3 className="text-lg font-medium text-on-surface">No data</h3>
                    <p className="text-sm text-on-surface-variant">Cognitive analytics will appear after 3 days of tracking.</p>
                </ScrollReveal>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Aurora's Deep Synthesis */}
                <ScrollReveal index={0} className="glass-panel p-8 rounded-xl border border-white/5 flex flex-col lg:row-span-2 lg:col-span-1 bg-gradient-to-b from-surface-container to-surface-container-low">
                    <div className="flex items-center gap-2 mb-6">
                        <span className="text-2xl">✨</span>
                        <h2 className="text-xl font-bold text-on-surface">Aurora&apos;s Synthesis</h2>
                    </div>
                    <div className="space-y-6 text-sm text-on-surface leading-relaxed flex-1">
                        <p>
                            Based on your recent cognitive logs, Aurora has detected a <strong className="text-emerald-400">highly focused phase</strong>. Your identity alignment has stabilized at {d.identity_alignment_avg}%, showing strong engagement with core objectives.
                        </p>
                        <p>
                            However, the RL Scheduler identified early indicators of <strong className="text-amber-400">decision fatigue</strong> peaking around 2 PM. Aurora recommends shifting heavily analytical tasks to the morning window.
                        </p>
                        <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 mt-auto">
                            <span className="text-primary font-bold text-xs uppercase tracking-wider block mb-2">Recommendation</span>
                            <span>Scale back context-switching tomorrow. Stick to one core project block.</span>
                        </div>
                    </div>
                </ScrollReveal>

                {/* Deep Work Context */}
                <ScrollReveal index={1} className="glass-panel p-6 rounded-xl border border-white/5 lg:col-span-2">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-xl">🌊</span>
                        <h2 className="text-sm font-medium text-on-surface-variant">Flow States (7 Days)</h2>
                    </div>
                    <AnalyticsDeepWorkChart data={demoWeeklyDeepWork} />
                </ScrollReveal>

                {/* Risk Indicators */}
                <ScrollReveal index={2} className="glass-panel p-6 rounded-xl border border-white/5 lg:col-span-2 flex flex-col justify-between">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-xl">⚕️</span>
                        <h2 className="text-sm font-medium text-on-surface-variant">Cognitive Friction</h2>
                    </div>
                    <AnalyticsRiskChart data={demoRiskTimeline} />
                </ScrollReveal>

                {/* Task Distribution */}
                <ScrollReveal index={3} className="glass-panel p-6 rounded-xl border border-white/5 lg:col-span-3">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-xl">📊</span>
                        <h2 className="text-sm font-medium text-on-surface-variant">Mission Breakdown</h2>
                    </div>
                    <AnalyticsCompletionChart data={demoCompletion} />
                </ScrollReveal>
            </div>
            )}
        </div>
    );
}

"use client";

import { useUser } from "@/lib/UserContext";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import MetricCard from "@/components/layout/MetricCard";
import { ErrorBanner, DemoBadge } from "@/components/ui/Skeleton";
import dynamic from "next/dynamic";
import { ChartSkeleton } from "@/components/ui/Skeleton";

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

    const { data: dashboard, error } = useApi(
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
                    Cognitive <span className="gradient-text">Analytics</span>
                </h1>
                {isDemo && <DemoBadge />}
            </div>
            <p className="text-on-surface-variant -mt-6 text-sm">System-wide metrics · Performance trends · Adaptive insights</p>

            {isDemo && <ErrorBanner message="Using simulated analytics" />}

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <MetricCard title="Deep Work" value={`${d.deep_work_hours}h`} animateValue={d.deep_work_hours} animateDecimals={1} icon="🧠" color="cyan" subtitle="today" />
                <MetricCard title="Identity Align" value={`${d.identity_alignment_avg}%`} animateValue={d.identity_alignment_avg} animateDecimals={1} icon="🧬" color="green" />
                <MetricCard title="Burnout Score" value={d.burnout_trend.toFixed(2)} animateValue={d.burnout_trend} animateDecimals={2} icon="🛡" color="rose" />
                <MetricCard title="RL Efficiency" value={`${Math.round(d.rl_strategy_efficiency * 100)}%`} animateValue={Math.round(d.rl_strategy_efficiency * 100)} icon="🤖" color="violet" />
                <MetricCard title="Task Rate" value={`${d.tasks_completed}/${d.tasks_total}`} icon="📊" color="green" subtitle={`${Math.round((d.tasks_completed / Math.max(d.tasks_total, 1)) * 100)}%`} />
                <MetricCard title="Decision Fatigue" value={d.decision_fatigue_index.toFixed(2)} animateValue={d.decision_fatigue_index} animateDecimals={2} icon="⚡" color="amber" subtitle={d.decision_fatigue_index > 0.6 ? "high" : "moderate"} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-panel p-6 rounded-xl border border-white/5">
                    <h2 className="section-title mb-1">Weekly Deep Work & Alignment</h2>
                    <p className="text-xs text-on-surface-variant mb-4">Hours of focused work vs identity alignment trend</p>
                    <AnalyticsDeepWorkChart data={demoWeeklyDeepWork} />
                </div>

                <div className="glass-panel p-6 rounded-xl border border-white/5">
                    <h2 className="section-title mb-1">Risk Indicators (14 Days)</h2>
                    <p className="text-xs text-on-surface-variant mb-4">Burnout probability and decision fatigue trends</p>
                    <AnalyticsRiskChart data={demoRiskTimeline} />
                </div>
            </div>

            <div className="glass-panel p-6 rounded-xl border border-white/5">
                <h2 className="section-title mb-1">Task Completion by Category</h2>
                <p className="text-xs text-on-surface-variant mb-6">Completed tasks vs total by work category</p>
                    <AnalyticsCompletionChart data={demoCompletion} />
            </div>
        </div>
    );
}

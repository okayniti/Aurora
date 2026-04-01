"use client";

import { useUser } from "@/lib/UserContext";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import MetricCard from "@/components/layout/MetricCard";
import { ErrorBanner, DemoBadge } from "@/components/ui/Skeleton";
import dynamic from "next/dynamic";
import { ChartSkeleton } from "@/components/ui/Skeleton";

const BurnoutTrendChart = dynamic(() => import("@/components/charts/BurnoutTrendChart"), {
    ssr: false,
    loading: () => <ChartSkeleton height="h-[280px]" />
});

const BurnoutFeatureChart = dynamic(() => import("@/components/charts/BurnoutFeatureChart"), {
    ssr: false,
    loading: () => <ChartSkeleton height="h-[280px]" />
});

const BurnoutDistributionChart = dynamic(() => import("@/components/charts/BurnoutDistributionChart"), {
    ssr: false,
    loading: () => <div className="h-[200px] w-[160px] animate-pulse bg-surface-container rounded-full" />
});

const demoTrend = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    probability: +(0.15 + Math.sin(i / 5) * 0.15 + Math.random() * 0.12).toFixed(3),
}));

const demoFeatures = [
    { name: "Stress Trend", value: 0.32, color: "#ff6e84" },
    { name: "Sleep Quality", value: 0.25, color: "#9093ff" },
    { name: "Cognitive Load", value: 0.20, color: "#fbbf24" },
    { name: "Deep Work Streak", value: 0.13, color: "#34d399" },
    { name: "Energy Variance", value: 0.10, color: "#cc97ff" },
];

// CustomTooltip moved out

export default function BurnoutPage() {
    const { userId } = useUser();

    const { data: trendData, error } = useApi(
        async () => {
            if (!userId) throw new Error("no user");
            const trend: any = await api.getBurnoutTrend(userId, 30);
            const points = trend.data_points || trend;
            if (!Array.isArray(points) || points.length === 0) return demoTrend;
            return points.map((t: any, i: number) => ({
                day: i + 1,
                probability: +(t.probability ?? t.burnout_probability ?? 0).toFixed(3),
            }));
        },
        demoTrend,
        [userId],
        { staleTime: 30000 }
    );

    const { data: featureData } = useApi(
        async () => {
            if (!userId) throw new Error("no user");
            const risk: any = await api.getBurnoutRisk(userId);
            if (!risk.feature_importance) return demoFeatures;
            return Object.entries(risk.feature_importance).map(([name, value], i) => ({
                name: name.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()),
                value: +(value as number).toFixed(3),
                color: ["#ff6e84", "#9093ff", "#fbbf24", "#34d399", "#cc97ff"][i % 5],
            }));
        },
        demoFeatures,
        [userId],
        { staleTime: 30000 }
    );

    const isDemo = !!error;
    const latest = (trendData || demoTrend)[(trendData || demoTrend).length - 1]?.probability || 0.34;
    const riskLevel = latest < 0.25 ? "Low" : latest < 0.5 ? "Moderate" : latest < 0.75 ? "High" : "Critical";
    const riskColor = latest < 0.25 ? "green" : latest < 0.5 ? "amber" : "rose";

    // Compute risk distribution from trend
    const riskDist = (trendData || demoTrend).reduce(
        (acc: any[], d: any) => {
            const level = d.probability < 0.25 ? 0 : d.probability < 0.5 ? 1 : d.probability < 0.75 ? 2 : 3;
            acc[level] = { ...acc[level], value: acc[level].value + 1 };
            return acc;
        },
        [
            { name: "Low", value: 0, fill: "#34d399" },
            { name: "Moderate", value: 0, fill: "#fbbf24" },
            { name: "High", value: 0, fill: "#ff6e84" },
            { name: "Critical", value: 0, fill: "#ef4444" },
        ]
    );

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-on-surface">
                    Burnout <span className="gradient-text">Monitor</span>
                </h1>
                {isDemo && <DemoBadge />}
            </div>
            <p className="text-on-surface-variant -mt-6 text-sm">XGBoost classifier · SHAP explainability · Real-time risk monitoring</p>

            {isDemo && <ErrorBanner message="Using simulated burnout data" />}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard title="Burnout Risk" value={latest.toFixed(3)} animateValue={latest} animateDecimals={3} icon="🛡" color={riskColor as any} subtitle={riskLevel} />
                <MetricCard title="Sleep Trend" value="6.8h" animateValue={6.8} animateDecimals={1} icon="😴" color="cyan" subtitle="below optimal" />
                <MetricCard title="Deep Work Streak" value="3.5h" animateValue={3.5} animateDecimals={1} icon="🧠" color="violet" trend="up" trendValue="today" />
                <MetricCard title="Cognitive Load" value="14.2" animateValue={14.2} animateDecimals={1} icon="⚡" color="amber" subtitle="elevated" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-panel p-6 rounded-xl border border-white/5">
                    <h2 className="section-title mb-1">30-Day Burnout Trend</h2>
                    <p className="text-xs text-on-surface-variant mb-4">Burnout probability over time · Threshold at 0.5</p>
                    <BurnoutTrendChart data={trendData} />
                </div>

                <div className="glass-panel p-6 rounded-xl border border-white/5">
                    <h2 className="section-title mb-1">Feature Importance (SHAP)</h2>
                    <p className="text-xs text-on-surface-variant mb-4">Explainable contribution to burnout prediction</p>
                    <BurnoutFeatureChart data={featureData} demoFeatures={demoFeatures} />
                </div>
            </div>

            <div className="glass-panel p-6 rounded-xl border border-white/5">
                <h2 className="section-title mb-1">Risk Level Distribution (Past 30 Days)</h2>
                <p className="text-xs text-on-surface-variant mb-4">Count of days at each risk level</p>
                <div className="flex items-center gap-8">
                    <BurnoutDistributionChart data={riskDist} />
                    <div className="flex-1 space-y-3">
                        {riskDist.map((item: any) => (
                            <div key={item.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                                    <span className="text-sm text-on-surface">{item.name}</span>
                                </div>
                                <span className="font-mono text-sm text-on-surface-variant">{item.value} days</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

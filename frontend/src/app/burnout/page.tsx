"use client";

import { useState, useEffect, useMemo } from "react";
import { useUser } from "@/lib/UserContext";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import MetricCard from "@/components/layout/MetricCard";
import { ErrorBanner, DemoBadge, ChartSkeleton, MetricSkeleton } from "@/components/ui/Skeleton";
import dynamic from "next/dynamic";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

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
    const [stressLevel, setStressLevel] = useState(5);
    const [cogLoad, setCogLoad] = useState(5);
    const [analyzing, setAnalyzing] = useState(false);

    const { data: trendData, error, loading: trendLoading, refetch: refetchTrend } = useApi(
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

    const { data: featureData, loading: featureLoading, refetch: refetchFeatures } = useApi(
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
    const loading = trendLoading || featureLoading;
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

    const stressEmoji = stressLevel >= 8 ? "😤" : stressLevel >= 5 ? "😬" : "😌";
    const plainEnglishRisk = latest < 0.25 ? "You're doing great!" : latest < 0.5 ? "Take it easy" : "Rest now";

    // On mount: load latest snapshot to initialize sliders
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                if (!userId) return;
                const res: any = await api.getLatestBurnoutSnapshot(userId);
                if (!mounted) return;
                if (res?.snapshot) {
                    if (typeof res.snapshot.stress_trend === 'number') setStressLevel(Math.round(res.snapshot.stress_trend));
                    if (typeof res.snapshot.cognitive_load === 'number') setCogLoad(Math.round(res.snapshot.cognitive_load));
                }
            } catch (e) {
                // ignore — will use defaults/demo
            }
        })();
        return () => { mounted = false; };
    }, [userId]);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-on-surface">
                    Burnout Monitor
                </h1>
                {isDemo && <DemoBadge />}
            </div>

            {isDemo && <ErrorBanner message="Using simulated burnout data" />}

            {loading && (!trendData || trendData.length === 0) ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <MetricSkeleton />
                    <MetricSkeleton />
                    <MetricSkeleton />
                    <MetricSkeleton />
                    <div className="col-span-2 p-6 glass-card rounded-xl border border-white/5">
                        <ChartSkeleton height="h-[220px]" />
                    </div>
                </div>
            ) : !isDemo && (!trendData || trendData.length === 0) ? (
                <ScrollReveal className="glass-panel p-12 text-center rounded-xl border border-white/5 flex flex-col items-center gap-4">
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 animate-pulse">monitor_heart</span>
                    <h3 className="text-lg font-medium text-on-surface">Warming Up</h3>
                    <p className="text-sm text-on-surface-variant">30-day monitor is warming up. Check back after logging energy data.</p>
                </ScrollReveal>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Burnout Risk */}
                <ScrollReveal index={0} className="glass-panel p-6 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl mb-2">🧨</span>
                    <div className={`text-5xl font-bold tracking-tighter ${riskColor === 'green' ? 'text-emerald-400' : riskColor === 'amber' ? 'text-amber-400' : 'text-rose-400'}`}>
                        {Math.round(latest * 100)}%
                    </div>
                    <span className="text-sm font-medium text-on-surface-variant mt-2">{plainEnglishRisk}</span>
                </ScrollReveal>

                {/* Stress Level */}
                <ScrollReveal index={1} className="glass-panel p-6 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl mb-2">{stressEmoji}</span>
                    <input
                        type="range"
                        min={1}
                        max={10}
                        value={stressLevel}
                        onChange={(e) => setStressLevel(+e.target.value)}
                        className="w-full h-2 rounded-lg appearance-none bg-surface-container accent-primary mt-2 mb-4"
                    />
                    <span className="text-sm font-medium text-on-surface-variant">Stress Level: {stressLevel}/10</span>
                </ScrollReveal>

                {/* Cognitive Load */}
                <ScrollReveal index={2} className="glass-panel p-6 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl mb-2">🧠</span>
                    <input
                        type="range"
                        min={1}
                        max={10}
                        value={cogLoad}
                        onChange={(e) => setCogLoad(+e.target.value)}
                        className="w-full h-2 rounded-lg appearance-none bg-surface-container accent-secondary mt-2 mb-4"
                    />
                    <span className="text-sm font-medium text-on-surface-variant">Cognitive Load: {cogLoad}/10</span>
                </ScrollReveal>

                {/* Top Factors */}
                <ScrollReveal index={3} className="glass-panel p-6 rounded-xl border border-white/5 row-span-1 flex flex-col text-left">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-xl">🔍</span>
                        <span className="text-sm font-medium text-on-surface-variant">What's Affecting You Most</span>
                    </div>
                    <ul className="space-y-4 flex-1">
                        {featureData?.slice(0, 3).map((f: any, idx: number) => (
                            <li key={idx} className="flex flex-col gap-1">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-on-surface font-medium">{f.name}</span>
                                    <span className="text-on-surface-variant">{(f.value * 100).toFixed(0)}%</span>
                                </div>
                                <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                                    <div 
                                        className="h-full rounded-full" 
                                        style={{ width: `${Math.min(f.value * 200, 100)}%`, backgroundColor: f.color }} 
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                </ScrollReveal>

                {/* 30-Day Trend */}
                <ScrollReveal index={4} className="glass-panel p-6 rounded-xl border border-white/5 col-span-2 flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-xl">📊</span>
                        <span className="text-sm font-medium text-on-surface-variant">30-Day Trend</span>
                    </div>
                    <div className="flex-1 min-h-[220px]">
                        <BurnoutTrendChart data={trendData} />
                    </div>
                </ScrollReveal>
            </div>
            )}

            <ScrollReveal index={5}>
                <button
                    onClick={async () => {
                        setAnalyzing(true);
                        try {
                            if (userId) {
                                await api.recordBurnoutSnapshot({
                                    user_id: userId,
                                    stress_trend: stressLevel,
                                    cognitive_load: cogLoad,
                                });
                                // Refresh charts
                                try { refetchTrend(); } catch {}
                                try { refetchFeatures(); } catch {}
                            }
                        } catch (err) {
                            // ignore for now
                        } finally {
                            setAnalyzing(false);
                        }
                    }}
                    disabled={analyzing}
                    className={`w-full py-4 rounded-xl text-on-primary text-lg font-bold tracking-wide outline-none focus-visible:outline-2 focus-visible:outline-primary active:scale-95 transition-all duration-200 bg-primary hover:bg-primary-dim shadow-glow disabled:opacity-40`}
                >
                    {analyzing ? "Analyzing Factors..." : "Check My Burnout"}
                </button>
            </ScrollReveal>
        </div>
    );
}

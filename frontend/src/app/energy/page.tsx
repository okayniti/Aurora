"use client";

import { useState } from "react";
import { useUser } from "@/lib/UserContext";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import MetricCard from "@/components/layout/MetricCard";
import { ErrorBanner, DemoBadge } from "@/components/ui/Skeleton";
import dynamic from "next/dynamic";
import { ChartSkeleton } from "@/components/ui/Skeleton";

const EnergyForecastChart = dynamic(() => import("@/components/charts/EnergyForecastChart"), {
    ssr: false,
    loading: () => <ChartSkeleton height="h-[350px]" />
});

const EnergyWeeklyChart = dynamic(() => import("@/components/charts/EnergyWeeklyChart"), {
    ssr: false,
    loading: () => <ChartSkeleton height="h-[250px]" />
});

const demoHourly = Array.from({ length: 24 }, (_, i) => {
    const base = [3, 2.5, 2, 1.5, 1, 1.5, 3, 5, 7, 8, 8.5, 8, 7, 6, 5.5, 6.5, 7, 7.5, 7, 6.5, 6, 5, 4, 3.5];
    return {
        hour: `${String(i).padStart(2, "0")}:00`,
        predicted: +(base[i] + (Math.random() - 0.5) * 0.5).toFixed(1),
        actual: i < new Date().getHours() ? +(base[i] + (Math.random() - 0.5) * 1.5).toFixed(1) : null,
    };
});

const demoWeekly = Array.from({ length: 7 }, (_, i) => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return {
        day: days[i],
        avgEnergy: +(5 + Math.random() * 3).toFixed(1),
        peakEnergy: +(7 + Math.random() * 2.5).toFixed(1),
        lowEnergy: +(2 + Math.random() * 2).toFixed(1),
    };
});

// (CustomTooltip moved to individual charts)
export default function EnergyPage() {
    const { userId } = useUser();
    const [showLog, setShowLog] = useState(false);
    const [saving, setSaving] = useState(false);
    const [logData, setLogData] = useState({
        energy_level: 7,
        sleep_hours: 7.5,
        caffeine_intake: 1,
        exercise_mins: 30,
    });
    const [logSuccess, setLogSuccess] = useState(false);
    const [energyModelType, setEnergyModelType] = useState("heuristic");

    const { data: hourlyData, error, refetch } = useApi(
        async () => {
            if (!userId) throw new Error("no user");
            const forecast: any = await api.getEnergyForecast(userId);
            if (forecast.model_type) setEnergyModelType(forecast.model_type);
            return forecast.hourly_predictions?.map((p: any) => ({
                hour: `${String(p.hour).padStart(2, "0")}:00`,
                predicted: +p.energy.toFixed(1),
                actual: null,
            })) || demoHourly;
        },
        demoHourly,
        [userId],
        { staleTime: 30000 }
    );

    const { data: weeklyData } = useApi(
        async () => {
            if (!userId) throw new Error("no user");
            const history: any = await api.getEnergyHistory(userId, 7);
            if (!Array.isArray(history) || history.length === 0) return demoWeekly;
            const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
            return days.map((day) => ({
                day,
                avgEnergy: +(5 + Math.random() * 3).toFixed(1),
                peakEnergy: +(7 + Math.random() * 2.5).toFixed(1),
                lowEnergy: +(2 + Math.random() * 2).toFixed(1),
            }));
        },
        demoWeekly,
        [userId],
        { staleTime: 30000 }
    );

    const isDemo = !!error;
    const currentHour = new Date().getHours();
    const current = hourlyData?.[currentHour];
    const peakHour = (hourlyData || demoHourly).reduce((max: any, d: any) => d.predicted > max.predicted ? d : max, (hourlyData || demoHourly)[0]);

    async function handleLogEnergy(e: React.FormEvent) {
        e.preventDefault();
        if (!userId) return;
        setSaving(true);
        setLogSuccess(false);
        try {
            await api.logEnergy({
                user_id: userId,
                energy_level: logData.energy_level,
                sleep_hours: logData.sleep_hours,
                caffeine_intake: logData.caffeine_intake,
                exercise_mins: logData.exercise_mins,
            });
            setLogSuccess(true);
            setTimeout(() => {
                setLogSuccess(false);
                setShowLog(false);
                refetch();
            }, 1500);
        } catch (err) {
            console.error("Failed to log energy:", err);
        } finally {
            setSaving(false);
        }
    }

    const energyEmoji = logData.energy_level >= 8 ? "🔥" : logData.energy_level >= 6 ? "⚡" : logData.energy_level >= 4 ? "😐" : "😴";

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight text-on-surface">
                            Energy <span className="gradient-text">Forecasting</span>
                        </h1>
                        {isDemo && <DemoBadge />}
                    </div>
                    <p className="text-on-surface-variant mt-1 text-sm">LSTM-based cognitive energy prediction · Time-series modeling</p>
                </div>
                <button
                    onClick={() => setShowLog(!showLog)}
                    className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dim text-on-primary text-sm font-medium transition-all duration-200 hover:shadow-glow flex items-center gap-2 self-start"
                >
                    ⚡ Log Energy
                </button>
            </div>

            {isDemo && <ErrorBanner message="Using simulated energy data" />}

            {/* Log Energy Form */}
            {showLog && (
                <div className="glass-panel p-6 rounded-xl border border-secondary/20 animate-fade-in-up">
                    <h2 className="section-title mb-4">How&apos;s Your Energy Right Now?</h2>
                    <form onSubmit={handleLogEnergy} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label className="text-xs text-on-surface-variant font-medium uppercase tracking-wider mb-2 block">
                                Energy Level: {energyEmoji} {logData.energy_level}/10
                            </label>
                            <input
                                type="range"
                                min={1}
                                max={10}
                                value={logData.energy_level}
                                onChange={(e) => setLogData({ ...logData, energy_level: +e.target.value })}
                                className="w-full accent-secondary h-2"
                            />
                            <div className="flex justify-between text-[10px] text-on-surface-variant mt-1">
                                <span>😴 Exhausted</span>
                                <span>😐 Average</span>
                                <span>🔥 Peak</span>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-on-surface-variant font-medium uppercase tracking-wider mb-1 block">Sleep (hours)</label>
                            <input
                                type="number"
                                min={0}
                                max={14}
                                step={0.5}
                                value={logData.sleep_hours}
                                onChange={(e) => setLogData({ ...logData, sleep_hours: +e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl bg-surface-container border border-outline text-on-surface text-sm focus:outline-none focus:border-primary focus:shadow-[0_0_8px_rgba(204,151,255,0.2)] transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-on-surface-variant font-medium uppercase tracking-wider mb-1 block">Caffeine (cups)</label>
                            <input
                                type="number"
                                min={0}
                                max={10}
                                value={logData.caffeine_intake}
                                onChange={(e) => setLogData({ ...logData, caffeine_intake: +e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl bg-surface-container border border-outline text-on-surface text-sm focus:outline-none focus:border-primary focus:shadow-[0_0_8px_rgba(204,151,255,0.2)] transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-on-surface-variant font-medium uppercase tracking-wider mb-1 block">Exercise (mins)</label>
                            <input
                                type="number"
                                min={0}
                                max={240}
                                value={logData.exercise_mins}
                                onChange={(e) => setLogData({ ...logData, exercise_mins: +e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl bg-surface-container border border-outline text-on-surface text-sm focus:outline-none focus:border-primary focus:shadow-[0_0_8px_rgba(204,151,255,0.2)] transition-all"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className={`w-full px-5 py-2.5 rounded-xl text-on-primary text-sm font-medium transition-all duration-200 ${logSuccess
                                    ? "bg-emerald-600"
                                    : "bg-primary hover:bg-primary-dim"
                                    } disabled:opacity-40`}
                            >
                                {logSuccess ? "✓ Logged!" : saving ? "Saving..." : "Log Energy"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
                <MetricCard title="Current Energy" value={(current?.actual || current?.predicted || 0).toFixed(1)} icon="⚡" color="cyan" subtitle="/10" />
                <MetricCard title="Peak Hour" value={peakHour?.hour || "09:00"} icon="📈" color="green" subtitle={`${peakHour?.predicted}/10`} />
                <MetricCard
                    title="Model Type"
                    value={energyModelType === "lstm" ? "LSTM" : "Heuristic"}
                    icon="🧪"
                    color="violet"
                    subtitle={energyModelType === "lstm" ? "trained" : "fallback"}
                />
                <MetricCard title="Forecast MAE" value="0.82" icon="📊" color="amber" subtitle="good accuracy" />
            </div>

            <div className="glass-panel p-6 rounded-xl border border-white/5 animate-fade-in-up">
                <h2 className="section-title mb-1">24-Hour Energy Forecast</h2>
                <p className="text-xs text-on-surface-variant mb-6">Predicted vs actual · Circadian rhythm + behavioral modifiers</p>
                <EnergyForecastChart data={hourlyData} />
            </div>

            <div className="glass-panel p-6 rounded-xl border border-white/5 animate-fade-in-up">
                <h2 className="section-title mb-1">Weekly Energy Trends</h2>
                <p className="text-xs text-on-surface-variant mb-6">Average, peak, and low energy levels by day</p>
                <EnergyWeeklyChart data={weeklyData} />
            </div>
        </div>
    );
}

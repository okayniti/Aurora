"use client";

import { useState } from "react";
import { useUser } from "@/lib/UserContext";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import MetricCard from "@/components/layout/MetricCard";
import { ErrorBanner, DemoBadge } from "@/components/ui/Skeleton";
import dynamic from "next/dynamic";
import { ChartSkeleton } from "@/components/ui/Skeleton";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

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

    const currentEnergyValue = (current?.actual || current?.predicted || 0).toFixed(1);
    const energyPercentage = Math.round((Number(currentEnergyValue) / 10) * 100);
    const energyColor = energyPercentage > 60 ? "text-emerald-400" : energyPercentage >= 30 ? "text-amber-400" : "text-rose-400";

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight text-on-surface">
                            Energy
                        </h1>
                        {isDemo && <DemoBadge />}
                    </div>
                </div>
            </div>

            {isDemo && <ErrorBanner message="Using simulated energy data" />}

            {!isDemo && (!hourlyData || hourlyData.length === 0) && (
                <ScrollReveal className="glass-panel p-12 text-center rounded-xl border border-white/5 flex flex-col items-center gap-4">
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 animate-pulse">battery_0_bar</span>
                    <h3 className="text-lg font-medium text-on-surface">No logs</h3>
                    <p className="text-sm text-on-surface-variant">No energy data yet. Log your first reading.</p>
                </ScrollReveal>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Your Energy Right Now */}
                <ScrollReveal index={0} className="glass-panel p-6 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl mb-2">🔋</span>
                    <div className={`text-5xl font-bold tracking-tighter ${energyColor}`}>
                        {energyPercentage}%
                    </div>
                    <span className="text-sm font-medium text-on-surface-variant mt-2">Your Energy Right Now</span>
                </ScrollReveal>

                {/* Sleep */}
                <ScrollReveal index={1} className="glass-panel p-6 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl mb-2">😴</span>
                    <input
                        type="number"
                        min={0}
                        max={12}
                        step={0.5}
                        value={logData.sleep_hours}
                        onChange={(e) => setLogData({ ...logData, sleep_hours: +e.target.value })}
                        className="w-24 text-center text-4xl font-bold bg-transparent border-b border-primary/30 focus:outline-none focus:border-primary transition-colors text-on-surface mb-2 px-1"
                    />
                    <span className="text-sm font-medium text-on-surface-variant">Last Night's Sleep (hrs)</span>
                </ScrollReveal>

                {/* Caffeine */}
                <ScrollReveal index={2} className="glass-panel p-6 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl mb-2">☕</span>
                    <input
                        type="number"
                        min={0}
                        max={10}
                        value={logData.caffeine_intake}
                        onChange={(e) => setLogData({ ...logData, caffeine_intake: +e.target.value })}
                        className="w-24 text-center text-4xl font-bold bg-transparent border-b border-primary/30 focus:outline-none focus:border-primary transition-colors text-on-surface mb-2 px-1"
                    />
                    <span className="text-sm font-medium text-on-surface-variant">Caffeine Today (cups)</span>
                </ScrollReveal>

                {/* Exercise */}
                <ScrollReveal index={3} className="glass-panel p-6 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl mb-2">🏃</span>
                    <button 
                        onClick={() => setLogData({ ...logData, exercise_mins: logData.exercise_mins > 0 ? 0 : 30 })}
                        className={`text-3xl font-bold px-6 py-2 rounded-xl transition-all ${logData.exercise_mins > 0 ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-surface-container text-on-surface border border-outline'}`}
                    >
                        {logData.exercise_mins > 0 ? "Yes" : "No"}
                    </button>
                    <span className="text-sm font-medium text-on-surface-variant mt-2">Exercise Today</span>
                </ScrollReveal>

                {/* Energy Forecast */}
                <ScrollReveal index={4} className="glass-panel p-6 rounded-xl border border-white/5 col-span-2 lg:col-span-2 flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-xl">📈</span>
                        <span className="text-sm font-medium text-on-surface-variant">Energy Forecast</span>
                    </div>
                    <div className="flex-1 min-h-[220px]">
                        <EnergyForecastChart data={hourlyData} />
                    </div>
                </ScrollReveal>
            </div>

            <ScrollReveal index={5}>
                <button
                    onClick={handleLogEnergy}
                    disabled={saving}
                    className={`w-full py-4 rounded-xl text-on-primary text-lg font-bold tracking-wide outline-none focus-visible:outline-2 focus-visible:outline-primary active:scale-95 transition-all duration-200 ${logSuccess
                        ? "bg-emerald-600"
                        : "bg-primary hover:bg-primary-dim shadow-glow"
                        } disabled:opacity-40`}
                >
                    {logSuccess ? "✓ Logged Successfully" : saving ? "Saving..." : "Log My Energy"}
                </button>
            </ScrollReveal>
        </div>
    );
}

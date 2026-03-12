"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/lib/UserContext";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import Link from "next/link";

// ── Fallback demo data ──────────────────────────────────────
const demoEnergy = Array.from({ length: 24 }, (_, i) => {
    const base = [3, 2.5, 2, 1.5, 1, 1.5, 3, 5, 7, 8, 8.5, 8, 7, 6, 5.5, 6.5, 7, 7.5, 7, 6.5, 6, 5, 4, 3.5];
    return {
        hour: `${String(i).padStart(2, "0")}:00`,
        predicted: +(base[i] + (Math.random() - 0.5)).toFixed(1),
        actual: i < new Date().getHours() ? +(base[i] + (Math.random() - 0.5) * 1.5).toFixed(1) : null,
    };
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

export default function Dashboard() {
    const { userId } = useUser();

    // Check-in state
    const [needsCheckin, setNeedsCheckin] = useState(true); // Always true on first load
    const [checkingIn, setCheckingIn] = useState(false);
    const [logData, setLogData] = useState({
        energy_level: 7,
        sleep_hours: 7.5,
        caffeine_intake: 1,
        exercise_mins: 30,
    });

    // Fetch dashboard data from API (falls back to demo)
    const { data: dashboard, refetch } = useApi(
        () => api.getDashboard(userId!),
        demoDashboard,
        [userId]
    );

    // Fetch energy forecast
    const { data: energyData } = useApi(
        async () => {
            if (!userId) throw new Error("no user");
            const forecast: any = await api.getEnergyForecast(userId);
            return forecast.hourly_predictions?.map((p: any) => ({
                hour: `${String(p.hour).padStart(2, "0")}:00`,
                predicted: +p.energy.toFixed(1),
                actual: null,
            })) || demoEnergy;
        },
        demoEnergy,
        [userId]
    );

    const handleCheckin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) {
            // If demo mode or no user, just progress anyway
            localStorage.setItem("aurora_last_checkin_date", new Date().toDateString());
            setNeedsCheckin(false);
            return;
        }
        setCheckingIn(true);
        try {
            await api.logEnergy({
                user_id: userId,
                ...logData
            });
            localStorage.setItem("aurora_last_checkin_date", new Date().toDateString());
            setNeedsCheckin(false);
            refetch();
        } catch (err) {
            console.error("Check-in failed:", err);
            // Even if it fails (e.g. backend down), let them in for demo purposes
            localStorage.setItem("aurora_last_checkin_date", new Date().toDateString());
            setNeedsCheckin(false);
        } finally {
            setCheckingIn(false);
        }
    };

    const d = dashboard || demoDashboard;
    const currentHour = new Date().getHours();
    const current = energyData?.[currentHour];

    if (needsCheckin) {
        const energyEmoji = logData.energy_level >= 8 ? "🔥" : logData.energy_level >= 6 ? "⚡" : logData.energy_level >= 4 ? "😐" : "😴";
        return (
            <div className="min-h-[85vh] flex items-center justify-center animate-fade-in px-4">
                <div className="glass-card max-w-xl w-full p-8 sm:p-10 border-cyan-700/30 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-cyan-500/10 blur-[100px] pointer-events-none transition-all duration-1000" />

                    <div className="text-center mb-8 relative z-10">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-aurora-500 flex items-center justify-center mx-auto mb-4 hover:scale-110 transition-transform shadow-glow">
                            <span className="text-3xl">🌅</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Good morning</h1>
                        <p className="text-sm text-gray-400">Let&apos;s calibrate today&apos;s cognitive models and optimize your schedule.</p>
                    </div>

                    <form onSubmit={handleCheckin} className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
                        <div className="sm:col-span-2">
                            <label className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-3 block text-center">
                                Current Energy: {energyEmoji} {logData.energy_level}/10
                            </label>
                            <input
                                type="range"
                                min={1}
                                max={10}
                                value={logData.energy_level}
                                onChange={(e) => setLogData({ ...logData, energy_level: +e.target.value })}
                                className="w-full accent-cyan-500 h-2 cursor-pointer"
                            />
                            <div className="flex justify-between text-[10px] text-gray-500 mt-2 font-medium">
                                <span>😴 Drained</span>
                                <span>😐 OK</span>
                                <span>🔥 Peak</span>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2 block">Sleep (hours)</label>
                            <input
                                type="number"
                                min={0}
                                max={14}
                                step={0.5}
                                value={logData.sleep_hours}
                                onChange={(e) => setLogData({ ...logData, sleep_hours: +e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-surface-400/80 border border-white/10 text-gray-200 text-base focus:outline-none focus:border-cyan-500 transition-colors placeholder-gray-600 text-center"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2 block">Caffeine (cups)</label>
                            <input
                                type="number"
                                min={0}
                                max={10}
                                value={logData.caffeine_intake}
                                onChange={(e) => setLogData({ ...logData, caffeine_intake: +e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-surface-400/80 border border-white/10 text-gray-200 text-base focus:outline-none focus:border-cyan-500 transition-colors placeholder-gray-600 text-center"
                            />
                        </div>

                        <div className="sm:col-span-2 pt-2 flex flex-col sm:flex-row items-center gap-4 justify-center">
                            <button
                                type="submit"
                                disabled={checkingIn}
                                className="w-full sm:w-1/2 px-6 py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-base font-semibold transition-all duration-200 hover:shadow-glow disabled:opacity-50"
                            >
                                {checkingIn ? "Calibrating..." : "Start My Day"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setNeedsCheckin(false)}
                                className="w-full sm:w-1/2 px-6 py-3.5 rounded-xl bg-surface-400 hover:bg-surface-300 border border-white/10 hover:border-white/20 text-gray-200 text-base font-semibold transition-all duration-200"
                            >
                                Skip for now
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header Text (optional, to keep some context) */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-md">
                        Cognitive Display Layer
                    </h1>
                    <p className="text-white/60 mt-1 text-sm font-medium">
                        Select a module below to view detailed neural analytics
                    </p>
                </div>
            </div>

            {/* Bento Grid layout based on user template */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[220px]">

                {/* Tile 1: Profile (Grey) */}
                <div className="bg-[#cdcdcd] text-black rounded-3xl p-6 relative col-span-1 row-span-1 flex flex-col justify-end transition-transform hover:-translate-y-1 shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
                    <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/50 flex items-center justify-center text-lg font-bold">✨</div>
                    <div className="absolute top-6 left-6 w-12 h-12 bg-black/10 rounded-full flex items-center justify-center text-xl">👤</div>
                    <h3 className="text-xl font-bold leading-tight mt-auto">Aurora<br />Engine</h3>
                    <p className="text-xs text-black/60 mt-2 font-medium uppercase tracking-widest">Calibrated</p>
                </div>

                {/* Tile 2: Energy Forecast (Orange) */}
                <Link href="/energy" className="bg-[#ff5a1f] text-white rounded-3xl p-6 relative col-span-1 md:col-span-2 lg:col-span-1 row-span-1 flex flex-col justify-end transition-transform hover:-translate-y-1 group shadow-[0_8px_30px_rgb(255,90,31,0.3)]">
                    <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold group-hover:bg-white group-hover:text-[#ff5a1f] transition-colors">+</div>
                    <div className="text-4xl font-bold mb-2">⚡ {(current?.actual || current?.predicted || 0).toFixed(1)}<span className="text-xl opacity-60">/10</span></div>
                    <h3 className="text-xl font-medium leading-tight">Energy<br />Forecast</h3>
                </Link>

                {/* Tile 3: Scheduler (Light Grey) */}
                <Link href="/scheduler" className="bg-[#e2e2e2] text-black rounded-3xl p-6 relative col-span-1 row-span-1 flex flex-col justify-end transition-transform hover:-translate-y-1 group shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
                    <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-black/10 flex items-center justify-center text-lg font-bold group-hover:bg-black group-hover:text-white transition-colors">+</div>
                    <div className="text-4xl font-bold mb-2">{d.tasks_completed}<span className="text-xl opacity-60">/{d.tasks_total}</span></div>
                    <h3 className="text-xl font-medium leading-tight">Tasks &<br />Scheduler</h3>
                </Link>

                {/* Tile 4: Burnout Risk (Red) */}
                <Link href="/burnout" className="bg-[#ea0b43] text-white rounded-3xl p-6 relative col-span-1 row-span-1 flex flex-col justify-end transition-transform hover:-translate-y-1 group shadow-[0_8px_30px_rgb(234,11,67,0.3)]">
                    <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold group-hover:bg-white group-hover:text-[#ea0b43] transition-colors">+</div>
                    <div className="text-5xl font-bold mb-2 tracking-tighter">{d.burnout_trend.toFixed(2)}</div>
                    <h3 className="text-xl font-medium leading-tight">Burnout<br />Monitor</h3>
                </Link>

                {/* Tile 5: Knowledge Hub / Analytics (Large Red/Pink) */}
                <Link href="/analytics" className="bg-[#d90038] text-white rounded-[2rem] p-8 relative col-span-1 md:col-span-2 row-span-2 flex flex-col justify-end transition-transform hover:-translate-y-1 group shadow-[0_8px_30px_rgb(217,0,56,0.3)] overflow-hidden">
                    <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold group-hover:bg-white group-hover:text-[#d90038] z-10 transition-colors">+</div>
                    <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-white/10 to-transparent z-0" />
                    <div className="absolute -right-10 -bottom-10 opacity-10 text-[200px] leading-none z-0">🧠</div>
                    <div className="relative z-10">
                        <div className="text-6xl font-bold mb-4 tracking-tighter">{d.deep_work_hours}<span className="text-3xl opacity-80">h</span></div>
                        <h3 className="text-3xl font-bold uppercase tracking-widest leading-tight">Cognitive<br />Analytics</h3>
                        <p className="mt-3 text-white/80 text-sm max-w-[80%] leading-relaxed font-medium">Comprehensive neural analysis of your deep work patterns, energy trends, and predictive model metrics.</p>
                    </div>
                </Link>

                {/* Tile 6: Identity (Grey) */}
                <Link href="/identity" className="bg-[#ebebeb] text-black rounded-3xl p-6 relative col-span-1 row-span-1 flex flex-col justify-end transition-transform hover:-translate-y-1 group shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
                    <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-black/10 flex items-center justify-center text-lg font-bold group-hover:bg-black group-hover:text-white transition-colors">+</div>
                    <div className="text-4xl font-bold mb-2">{d.identity_alignment_avg}%</div>
                    <h3 className="text-xl font-medium leading-tight">Identity<br />Alignment</h3>
                </Link>

                {/* Tile 7: RL Agent (Purple) */}
                <div className="bg-[#8c00ff] text-white rounded-3xl p-6 relative col-span-1 md:col-span-2 lg:col-span-1 row-span-1 flex flex-col justify-end transition-transform hover:-translate-y-1 group shadow-[0_8px_30px_rgb(140,0,255,0.3)]">
                    <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold group-hover:bg-white group-hover:text-[#8c00ff] transition-colors">+</div>
                    <div className="text-4xl font-bold mb-2">{Math.round(d.rl_strategy_efficiency * 100)}%</div>
                    <h3 className="text-xl font-medium leading-tight">RL Strategy<br />Efficiency</h3>
                </div>

                {/* Tile 8: Image Background / Quick Actions */}
                <div className="bg-[#1a1a1a] text-white rounded-3xl p-6 relative col-span-1 md:col-span-2 lg:col-span-2 row-span-1 overflow-hidden transition-transform hover:-translate-y-1 flex flex-col justify-end shadow-[0_8px_30px_rgb(0,0,0,0.6)] group">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent z-10" />
                    <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80" alt="Team" className="absolute inset-0 w-full h-full object-cover opacity-60 z-0 grayscale mix-blend-overlay group-hover:scale-105 transition-transform duration-700" />
                    <button
                        onClick={() => setNeedsCheckin(true)}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#ff5a1f] flex items-center justify-center text-lg font-bold z-20 hover:scale-110 transition-transform shadow-[0_0_15px_rgb(255,90,31,0.5)] cursor-pointer"
                    >
                        +
                    </button>
                    <div className="relative z-20">
                        <h3 className="text-2xl font-bold leading-tight">Calibration <span className="text-[#ff5a1f]">Sync</span></h3>
                        <p className="text-sm text-gray-300 mt-1 max-w-[80%] font-medium">Trigger manual check-in to realign reinforcement models.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

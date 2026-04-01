"use client";

import { useState, useEffect, useMemo } from "react";
import { useUser } from "@/lib/UserContext";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/Skeleton";
import { Spotlight } from "@/components/ui/Spotlight";
import { ShimmerButton } from "@/components/ui/ShimmerButton";
import { CardTilt } from "@/components/ui/CardTilt";
import { TypingPlaceholder } from "@/components/ui/TypingPlaceholder";

// ── Fallback demo data (used when API is unavailable) ────────
const demoDashboard = {
    deep_work_hours: 4.2,
    identity_alignment_avg: 73.5,
    burnout_trend: 0.02,
    rl_strategy_efficiency: 0.94,
    energy_forecast_mae: 0.8,
    decision_fatigue_index: 0.42,
    tasks_completed: 6,
    tasks_total: 10,
};

const demoTasks = [
    {
        time: "09:00 AM",
        title: "Neural Calibration",
        desc: "Synchronizing conscious focus with digital intent.",
        status: "done" as const,
    },
    {
        time: "ACTIVE NOW",
        title: "Mission of the Day",
        desc: "Refining the architectural core of the Aurora Neural Net.",
        status: "active" as const,
    },
    {
        time: "04:30 PM",
        title: "Atmospheric Integration",
        desc: "Finalizing the visual fluidities for the main hub.",
        status: "upcoming" as const,
    },
];

const demoBurnout = {
    burnout_probability: 0.02,
    risk_level: "low" as const,
    feature_importance: {},
    model_type: "rule_based",
};

const demoForecast = {
    hourly_predictions: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        energy: [3, 2.5, 2, 1.5, 1, 1.5, 3, 5, 7, 8, 8.5, 8, 7, 6, 5.5, 6.5, 7, 7.5, 7, 6.5, 6, 5, 4, 3.5][i],
    })),
    model_type: "heuristic",
    confidence: 0.75,
};

// ── Timer constants ─────────────────────────────────────────
const TOTAL_SECONDS = 42 * 60 + 12;

// ── Helpers ─────────────────────────────────────────────────
function mapTasksToTimeline(tasks: any[]): typeof demoTasks {
    if (!tasks || tasks.length === 0) return [];

    return tasks.slice(0, 5).map((t: any) => {
        let status: "done" | "active" | "upcoming" = "upcoming";
        if (t.status === "done") status = "done";
        else if (t.status === "in_progress") status = "active";

        const start = t.scheduled_start
            ? new Date(t.scheduled_start).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
            : t.status === "in_progress"
            ? "ACTIVE NOW"
            : "Pending";

        return {
            time: status === "active" ? "ACTIVE NOW" : start,
            title: t.title || "Untitled Task",
            desc: t.description || `Priority ${t.priority || 3} · ${t.category || "general"}`,
            status,
        };
    });
}

function getActiveTaskName(tasks: any[]): string {
    if (!tasks || tasks.length === 0) return "Architecture";
    const active = tasks.find((t: any) => t.status === "in_progress");
    const name = active?.title || tasks.find((t: any) => t.status === "pending")?.title || "Architecture";
    // Truncate to max 3 words
    const words = name.split(" ");
    if (words.length <= 3) return name;
    return words.slice(0, 3).join(" ") + "…";
}

function getCortexStatus(burnoutProb: number): { label: string; color: string } {
    if (burnoutProb < 0.2) return { label: "Synced", color: "text-secondary" };
    if (burnoutProb < 0.6) return { label: "Stressed", color: "text-amber-400" };
    return { label: "Critical", color: "text-error" };
}

function getFrequencyMode(energy: number): { label: string; desc: string } {
    if (energy >= 7) return { label: "High-Frequency", desc: "Your cognitive load is optimal. The environment is shifting to" };
    if (energy >= 4) return { label: "Medium-Frequency", desc: "Your cognitive load is moderate. The environment is maintaining" };
    return { label: "Recovery", desc: "Your energy is low. The environment is switching to" };
}

function getNeuralMessage(burnoutProb: number): string {
    if (burnoutProb < 0.2)
        return '"Your patterns are remarkably consistent. I\'ve optimized the environment for sustained deep work."';
    if (burnoutProb < 0.4)
        return '"I noticed a slight divergence in your pattern syntax. Shall I initiate a corrective sweep of the core modules?"';
    if (burnoutProb < 0.6)
        return '"Your stress indicators are trending upward. Consider a recovery break — I can reschedule lower-priority tasks."';
    return '"Critical burnout risk detected. I strongly recommend pausing non-essential work. Your recovery is the priority."';
}

export default function Dashboard() {
    const { userId } = useUser();
    const [elapsed, setElapsed] = useState(0);

    // ── API calls with automatic fallback ──────────────────
    const {
        data: tasks,
        loading: tasksLoading,
        error: tasksError,
        refetch: refetchTasks,
    } = useApi<any[]>(
        () => (userId ? api.getTasks(userId) as Promise<any[]> : Promise.reject("no user")),
        [],
        [userId]
    );

    const {
        data: dashboard,
        loading: dashLoading,
        error: dashError,
        refetch: refetchDash,
    } = useApi<any>(
        () => (userId ? api.getDashboard(userId) as Promise<any> : Promise.reject("no user")),
        demoDashboard,
        [userId]
    );

    const {
        data: burnout,
        loading: burnoutLoading,
        error: burnoutError,
        refetch: refetchBurnout,
    } = useApi<any>(
        () => (userId ? api.getBurnoutRisk(userId) as Promise<any> : Promise.reject("no user")),
        demoBurnout,
        [userId]
    );

    const {
        data: forecast,
        loading: forecastLoading,
        error: forecastError,
        refetch: refetchForecast,
    } = useApi<any>(
        () => (userId ? api.getEnergyForecast(userId) as Promise<any> : Promise.reject("no user")),
        demoForecast,
        [userId]
    );

    // Countdown timer
    useEffect(() => {
        const interval = setInterval(() => {
            setElapsed((prev) => (prev + 1) % TOTAL_SECONDS);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // ── Derived state ──────────────────────────────────────
    const remaining = TOTAL_SECONDS - elapsed;
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    const progress = remaining / TOTAL_SECONDS;

    const d = dashboard || demoDashboard;
    const b = burnout || demoBurnout;
    const f = forecast || demoForecast;

    const burnoutProb = b.burnout_probability ?? d.burnout_trend ?? 0.02;
    const currentHour = new Date().getHours();
    const currentEnergy = f.hourly_predictions?.[currentHour]?.energy ?? 7;
    const energyResonance = Math.round((currentEnergy / 10) * 100);
    const cortex = getCortexStatus(burnoutProb);
    const freq = getFrequencyMode(currentEnergy);
    const neuralMessage = getNeuralMessage(burnoutProb);

    const timelineTasks = tasks && tasks.length > 0 ? mapTasksToTimeline(tasks) : demoTasks;
    const activeTaskName = tasks && tasks.length > 0 ? getActiveTaskName(tasks) : "Architecture";

    const isDemo = !!(tasksError && dashError);

    // SVG ring
    const RING_RADIUS = 110;
    const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
    const strokeDashoffset = useMemo(
        () => RING_CIRCUMFERENCE * (1 - progress),
        [progress, RING_CIRCUMFERENCE]
    );

    return (
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 min-h-[calc(100vh-8rem)] animate-fade-in">
            {/* ══════════════════════════════════════════════
                LEFT COLUMN: Task Timeline Journey
               ══════════════════════════════════════════════ */}
            <section className="w-full lg:w-1/4 flex flex-col gap-10 lg:gap-16 relative py-8 order-2 lg:order-1">
                {/* Vertical line */}
                <div className="absolute left-6 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-primary/20 to-transparent" />

                {/* Header */}
                <header className="pl-12">
                    <span className="label-sm">Current Journey</span>
                    <h2 className="text-2xl font-light tracking-tight mt-2 text-on-surface">
                        System Alignment
                    </h2>
                    {/* Subtle error badge */}
                    {tasksError && (
                        <button
                            onClick={refetchTasks}
                            className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] tracking-wider hover:bg-amber-500/20 transition-colors"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            DEMO · tap to retry
                        </button>
                    )}
                </header>

                {/* Task Nodes */}
                <div className="flex flex-col gap-20">
                    {tasksLoading ? (
                        // Loading skeleton
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="pl-12 animate-pulse">
                                <Skeleton className="h-3 w-20 mb-2" />
                                <Skeleton className="h-5 w-40 mb-1" />
                                <Skeleton className="h-3 w-52" />
                            </div>
                        ))
                    ) : timelineTasks.length === 0 ? (
                        // Empty state
                        <div className="pl-12 text-center py-12">
                            <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-4 block">
                                task_alt
                            </span>
                            <p className="text-on-surface-variant text-sm">No tasks yet</p>
                            <p className="text-on-surface-variant/50 text-xs mt-1">
                                Add one in Scheduler →
                            </p>
                        </div>
                    ) : (
                        timelineTasks.map((task, i) => (
                            <div
                                key={i}
                                className={`group relative pl-12 transition-all duration-500 ${
                                    task.status === "upcoming"
                                        ? "opacity-40 hover:opacity-80"
                                        : ""
                                }`}
                            >
                                {/* Left border indicator */}
                                {task.status === "active" ? (
                                    <div className="absolute left-0 top-0 bottom-0 w-[2px] rounded-full animate-border-glow border-l-2 border-secondary" />
                                ) : task.status === "done" ? (
                                    <div className="absolute left-0 top-0 bottom-0 w-[2px] rounded-full bg-primary/30" />
                                ) : (
                                    <div className="absolute left-0 top-0 bottom-0 w-[2px] rounded-full bg-outline-variant/20" />
                                )}

                                {/* Node dot */}
                                {task.status === "active" ? (
                                    <div className="absolute left-3 -top-1 w-6 h-6 rounded-full border-2 border-secondary flex items-center justify-center animate-pulse z-10 bg-background">
                                        <div className="w-2 h-2 rounded-full bg-secondary" />
                                    </div>
                                ) : task.status === "done" ? (
                                    <div className="absolute left-3.5 top-1 w-5 h-5 rounded-full bg-primary/20 border border-primary flex items-center justify-center z-10">
                                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                            <path d="M2 5L4.5 7.5L8 3" stroke="#cc97ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                ) : (
                                    <div className="absolute left-4 top-2 w-4 h-4 rounded-full bg-outline-variant/40 z-10" />
                                )}

                                {/* Content */}
                                <div className="flex flex-col gap-1">
                                    <span
                                        className={`label-xs ${
                                            task.status === "active"
                                                ? "text-secondary"
                                                : task.status === "done"
                                                ? "text-primary"
                                                : "text-on-surface-variant"
                                        }`}
                                    >
                                        {task.status === "done" && "✓ "}
                                        {task.time}
                                    </span>
                                    <h3
                                        className={`text-on-surface group-hover:text-primary transition-colors ${
                                            task.status === "active"
                                                ? "text-xl font-bold"
                                                : task.status === "done"
                                                ? "font-medium opacity-70"
                                                : "font-medium"
                                        }`}
                                    >
                                        {task.title}
                                    </h3>
                                    <p className="text-on-surface-variant text-sm leading-relaxed mt-1 opacity-70">
                                        {task.desc}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* ══════════════════════════════════════════════
                CENTER: Dynamic Intelligence Hub
               ══════════════════════════════════════════════ */}
            <section className="flex-1 flex flex-col items-center justify-center relative min-h-[400px] lg:min-h-[614px] order-1 lg:order-2">
                {/* Ambient spotlight follows mouse */}
                <Spotlight color="rgba(204, 151, 255, 0.06)" size={700} />
                {/* Animated Energy Wave SVG */}
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden -z-10 opacity-30">
                    <svg className="w-full h-full" viewBox="0 0 800 400">
                        <path
                            className="energy-wave"
                            d="M0 200 Q 200 100 400 200 T 800 200"
                            fill="none"
                            stroke="url(#gradient-energy)"
                            strokeWidth="4"
                        >
                            <animate
                                attributeName="d"
                                dur="10s"
                                repeatCount="indefinite"
                                values="M0 200 Q 200 100 400 200 T 800 200; M0 200 Q 200 300 400 200 T 800 200; M0 200 Q 200 100 400 200 T 800 200"
                            />
                        </path>
                        <defs>
                            <linearGradient id="gradient-energy" x1="0%" x2="100%" y1="0%" y2="0%">
                                <stop offset="0%" style={{ stopColor: "#cc97ff", stopOpacity: 0 }} />
                                <stop offset="50%" style={{ stopColor: "#3adffa", stopOpacity: 1 }} />
                                <stop offset="100%" style={{ stopColor: "#9093ff", stopOpacity: 0 }} />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                {/* Focus Zone */}
                <div className="relative w-full max-w-2xl text-center space-y-8">
                    {/* Energy Resonance Badge — real data */}
                    {forecastLoading ? (
                        <Skeleton className="h-10 w-64 mx-auto rounded-full" />
                    ) : (
                        <div className="inline-block px-6 py-2 rounded-full glass-panel border border-secondary/20 mb-4">
                            <span className="text-secondary text-xs uppercase tracking-[0.3em]">
                                Energy Resonance: {energyResonance}%
                            </span>
                            {forecastError && (
                                <button onClick={refetchForecast} className="ml-2 text-amber-400 text-[10px]">↻</button>
                            )}
                        </div>
                    )}

                    {/* Hero Heading — shows active task name */}
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-none bg-gradient-to-b from-on-surface to-on-surface-variant bg-clip-text text-transparent">
                        Focusing on{" "}
                        <span className="text-primary italic">{activeTaskName}</span>
                    </h1>

                    {/* Description — dynamic frequency mode */}
                    <p className="text-on-surface-variant text-base md:text-lg max-w-lg mx-auto font-light leading-relaxed">
                        {freq.desc}{" "}
                        <span className="text-secondary">{freq.label}</span> mode to
                        support complex synthesis.
                    </p>

                    {/* Alignment Ring with SVG Progress */}
                    <div className="relative w-48 h-48 md:w-64 md:h-64 mx-auto mt-8 md:mt-12 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-2 border-primary/10 scale-110" />

                        <svg
                            className="absolute inset-0 w-full h-full -rotate-90"
                            viewBox="0 0 256 256"
                            style={{ filter: "drop-shadow(0 0 8px rgba(204, 151, 255, 0.3))" }}
                        >
                            <defs>
                                <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#cc97ff" />
                                    <stop offset="100%" stopColor="#8a5cbf" />
                                </linearGradient>
                            </defs>
                            <circle cx="128" cy="128" r={RING_RADIUS} fill="none" stroke="rgba(204, 151, 255, 0.08)" strokeWidth="3" />
                            <circle
                                cx="128" cy="128" r={RING_RADIUS} fill="none"
                                stroke="url(#ring-gradient)" strokeWidth="3" strokeLinecap="round"
                                strokeDasharray={RING_CIRCUMFERENCE} strokeDashoffset={strokeDashoffset}
                                style={{ transition: "stroke-dashoffset 1s linear" }}
                            />
                        </svg>

                        <div className="absolute inset-4 rounded-full border border-secondary/20 rotate-45" />

                        <div className="w-36 h-36 md:w-48 md:h-48 rounded-full glass-panel border border-white/5 flex flex-col items-center justify-center p-6 md:p-8 shadow-2xl z-10">
                            <span className="text-[0.625rem] text-on-surface-variant uppercase tracking-widest mb-1">
                                Time to Peak
                            </span>
                            <span className="text-3xl md:text-4xl font-light tracking-tighter text-on-surface tabular-nums">
                                {String(minutes).padStart(2, "0")}:
                                {String(seconds).padStart(2, "0")}
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════
                RIGHT COLUMN: AI Presence & Insights
               ══════════════════════════════════════════════ */}
            <section className="w-full lg:w-1/4 flex flex-col justify-end gap-3 pb-12 order-3 lg:order-3">
                {/* Neural Insight Panel — dynamic message */}
                {burnoutLoading ? (
                    <div className="glass-panel p-5 md:p-8 rounded-xl border border-primary/10 space-y-4 animate-pulse">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-16 w-full" />
                        <div className="flex gap-4">
                            <Skeleton className="h-10 w-24 rounded-full" />
                            <Skeleton className="h-10 w-24 rounded-full" />
                        </div>
                    </div>
                ) : (
                    <CardTilt>
                    <div className="glass-panel p-5 md:p-8 rounded-xl border border-primary/10 shadow-xl space-y-4">
                        <div className="flex items-center gap-3 text-primary">
                            <span className="material-symbols-outlined text-lg">psychology</span>
                            <span className="label-sm !text-primary !tracking-widest">
                                Neural Insight
                            </span>
                            {burnoutError && (
                                <button onClick={refetchBurnout} className="ml-auto text-amber-400 text-[10px] px-2 py-1 rounded-full bg-amber-500/10">
                                    ↻ retry
                                </button>
                            )}
                        </div>
                        <p className="text-on-surface-variant text-sm leading-relaxed">
                            {neuralMessage}
                        </p>
                        <div className="flex gap-4 pt-4">
                            <ShimmerButton variant="primary">Proceed</ShimmerButton>
                            <ShimmerButton variant="ghost">Dismiss</ShimmerButton>
                        </div>
                    </div>
                    </CardTilt>
                )}

                {/* Vibe Status Panel — real burnout data */}
                {dashLoading ? (
                    <div className="glass-panel p-5 md:p-8 rounded-xl border border-white/5 space-y-6 animate-pulse">
                        <Skeleton className="h-6 w-32" />
                        <div className="grid grid-cols-2 gap-4">
                            <Skeleton className="h-20 rounded-lg" />
                            <Skeleton className="h-20 rounded-lg" />
                        </div>
                    </div>
                ) : (
                    <CardTilt>
                    <div className="glass-panel p-5 md:p-8 rounded-xl border border-white/5 space-y-6">
                        <div className="flex justify-between items-end">
                            <div className="space-y-1">
                                <span className="text-on-surface-variant text-[0.625rem] uppercase tracking-widest">
                                    Vibe Status
                                </span>
                                <div className="text-xl font-medium text-on-surface">
                                    {burnoutProb < 0.2 ? "Flow State" : burnoutProb < 0.5 ? "Active Mode" : "Recovery Needed"}
                                </div>
                            </div>
                            <div className="flex gap-1 h-8 items-end">
                                <div className="w-1 bg-primary h-1/2 rounded-full" />
                                <div className="w-1 bg-secondary h-full rounded-full animate-pulse" />
                                <div className="w-1 bg-tertiary h-2/3 rounded-full" />
                                <div className="w-1 bg-primary h-3/4 rounded-full" />
                            </div>
                            {dashError && (
                                <button onClick={refetchDash} className="text-amber-400 text-[10px]">↻</button>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg bg-surface-container-low border border-white/5">
                                <div className="text-on-surface-variant text-[0.5rem] uppercase mb-1">
                                    Cortex
                                </div>
                                <div className={`font-medium ${cortex.color}`}>{cortex.label}</div>
                            </div>
                            <div className="p-4 rounded-lg bg-surface-container-low border border-white/5">
                                <div className="text-on-surface-variant text-[0.5rem] uppercase mb-1">
                                    Burnout
                                </div>
                                <div className="text-on-surface font-medium">
                                    {Math.round(burnoutProb * 100)}% risk
                                </div>
                            </div>
                        </div>
                    </div>
                    </CardTilt>
                )}

                {/* Conversational AI Input */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shrink-0 shadow-lg">
                            <span
                                className="material-symbols-outlined text-background text-sm"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                                auto_awesome
                            </span>
                        </div>
                        <div className="bg-surface-container-high/60 px-5 py-3 rounded-2xl rounded-tl-none text-sm text-on-surface leading-snug">
                            Ready when you are. The environment has been optimized for deep work.
                        </div>
                    </div>
                    <TypingPlaceholder
                        phrases={[
                            "Speak to Aurora...",
                            "How is my energy today?",
                            "Schedule my deep work...",
                            "What is my burnout risk?",
                        ]}
                    />
                </div>
            </section>
        </div>
    );
}

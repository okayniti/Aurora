"use client";

import { useState, useEffect, useMemo } from "react";
import { useUser } from "@/lib/UserContext";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";

// ── Fallback demo data ──────────────────────────────────────
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

// ── Timer constants ─────────────────────────────────────────
const TOTAL_SECONDS = 42 * 60 + 12; // 42:12

export default function Dashboard() {
    const { userId } = useUser();
    const [aiMessage] = useState(
        "Ready when you are. The environment has been optimized for deep work."
    );
    const [elapsed, setElapsed] = useState(0);

    // Fetch dashboard data from API (falls back to demo)
    const { data: dashboard } = useApi(
        () => api.getDashboard(userId!),
        demoDashboard,
        [userId]
    );

    // Countdown timer
    useEffect(() => {
        const interval = setInterval(() => {
            setElapsed((prev) => (prev + 1) % TOTAL_SECONDS);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const remaining = TOTAL_SECONDS - elapsed;
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    const progress = remaining / TOTAL_SECONDS; // 1 → 0

    const d = dashboard || demoDashboard;
    const energyResonance = Math.round((1 - d.burnout_trend) * 100);

    // SVG ring values
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
                </header>

                {/* Task Nodes */}
                <div className="flex flex-col gap-20">
                    {demoTasks.map((task, i) => (
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
                    ))}
                </div>
            </section>

            {/* ══════════════════════════════════════════════
                CENTER: Dynamic Intelligence Hub
               ══════════════════════════════════════════════ */}
            <section className="flex-1 flex flex-col items-center justify-center relative min-h-[400px] lg:min-h-[614px] order-1 lg:order-2">
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
                            <linearGradient
                                id="gradient-energy"
                                x1="0%"
                                x2="100%"
                                y1="0%"
                                y2="0%"
                            >
                                <stop offset="0%" style={{ stopColor: "#cc97ff", stopOpacity: 0 }} />
                                <stop offset="50%" style={{ stopColor: "#3adffa", stopOpacity: 1 }} />
                                <stop offset="100%" style={{ stopColor: "#9093ff", stopOpacity: 0 }} />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                {/* Focus Zone */}
                <div className="relative w-full max-w-2xl text-center space-y-8">
                    {/* Energy Resonance Badge */}
                    <div className="inline-block px-6 py-2 rounded-full glass-panel border border-secondary/20 mb-4">
                        <span className="text-secondary text-xs uppercase tracking-[0.3em]">
                            Energy Resonance: {energyResonance}%
                        </span>
                    </div>

                    {/* Hero Heading */}
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-none bg-gradient-to-b from-on-surface to-on-surface-variant bg-clip-text text-transparent">
                        Focusing on{" "}
                        <span className="text-primary italic">Architecture</span>
                    </h1>

                    {/* Description */}
                    <p className="text-on-surface-variant text-base md:text-lg max-w-lg mx-auto font-light leading-relaxed">
                        Your cognitive load is optimal. The environment is shifting to{" "}
                        <span className="text-secondary">High-Frequency</span> mode to
                        support complex synthesis.
                    </p>

                    {/* ── Task 1: Alignment Ring with SVG Progress ── */}
                    <div className="relative w-48 h-48 md:w-64 md:h-64 mx-auto mt-8 md:mt-12 flex items-center justify-center">
                        {/* Outer decorative ring */}
                        <div className="absolute inset-0 rounded-full border-2 border-primary/10 scale-110" />

                        {/* SVG Progress Ring */}
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
                            {/* Background track */}
                            <circle
                                cx="128"
                                cy="128"
                                r={RING_RADIUS}
                                fill="none"
                                stroke="rgba(204, 151, 255, 0.08)"
                                strokeWidth="3"
                            />
                            {/* Progress arc */}
                            <circle
                                cx="128"
                                cy="128"
                                r={RING_RADIUS}
                                fill="none"
                                stroke="url(#ring-gradient)"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeDasharray={RING_CIRCUMFERENCE}
                                strokeDashoffset={strokeDashoffset}
                                style={{ transition: "stroke-dashoffset 1s linear" }}
                            />
                        </svg>

                        {/* Inner decorative ring */}
                        <div className="absolute inset-4 rounded-full border border-secondary/20 rotate-45" />

                        {/* Center glass circle */}
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
                Task 4: Consistent gap-3 spacing
               ══════════════════════════════════════════════ */}
            <section className="w-full lg:w-1/4 flex flex-col justify-end gap-3 pb-12 order-3 lg:order-3">
                {/* Neural Insight Panel */}
                <div className="glass-panel p-5 md:p-8 rounded-xl border border-primary/10 shadow-xl space-y-4">
                    <div className="flex items-center gap-3 text-primary">
                        <span className="material-symbols-outlined text-lg">psychology</span>
                        <span className="label-sm !text-primary !tracking-widest">
                            Neural Insight
                        </span>
                    </div>
                    <p className="text-on-surface-variant text-sm leading-relaxed">
                        &quot;I noticed a slight divergence in your pattern syntax. Shall I
                        initiate a corrective sweep of the core modules?&quot;
                    </p>
                    <div className="flex gap-4 pt-4">
                        <button className="px-4 py-2 min-h-[44px] rounded-full bg-primary/10 hover:bg-primary/20 text-primary text-[0.625rem] uppercase tracking-widest transition-all">
                            Proceed
                        </button>
                        <button className="px-4 py-2 min-h-[44px] rounded-full border border-white/5 text-on-surface-variant text-[0.625rem] uppercase tracking-widest hover:text-on-surface transition-all">
                            Dismiss
                        </button>
                    </div>
                </div>

                {/* Vibe Status Panel */}
                <div className="glass-panel p-5 md:p-8 rounded-xl border border-white/5 space-y-6">
                    <div className="flex justify-between items-end">
                        <div className="space-y-1">
                            <span className="text-on-surface-variant text-[0.625rem] uppercase tracking-widest">
                                Vibe Status
                            </span>
                            <div className="text-xl font-medium text-on-surface">
                                Flow State
                            </div>
                        </div>
                        <div className="flex gap-1 h-8 items-end">
                            <div className="w-1 bg-primary h-1/2 rounded-full" />
                            <div className="w-1 bg-secondary h-full rounded-full animate-pulse" />
                            <div className="w-1 bg-tertiary h-2/3 rounded-full" />
                            <div className="w-1 bg-primary h-3/4 rounded-full" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-surface-container-low border border-white/5">
                            <div className="text-on-surface-variant text-[0.5rem] uppercase mb-1">
                                Cortex
                            </div>
                            <div className="text-secondary font-medium">Synced</div>
                        </div>
                        <div className="p-4 rounded-lg bg-surface-container-low border border-white/5">
                            <div className="text-on-surface-variant text-[0.5rem] uppercase mb-1">
                                Burnout
                            </div>
                            <div className="text-on-surface font-medium">
                                {Math.round(d.burnout_trend * 100)}% risk
                            </div>
                        </div>
                    </div>
                </div>

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
                            {aiMessage}
                        </div>
                    </div>
                    <div className="relative">
                        <input
                            className="w-full bg-surface-container-lowest/40 border-0 border-b-2 border-white/10 focus:border-primary focus:shadow-[0_2px_12px_rgba(204,151,255,0.25)] text-sm py-4 px-0 placeholder:text-on-surface-variant/40 transition-all duration-300 text-on-surface outline-none"
                            placeholder="Speak to Aurora..."
                            type="text"
                        />
                        <button className="absolute right-0 top-1/2 -translate-y-1/2 text-primary/60 hover:text-primary transition-colors">
                            <span className="material-symbols-outlined">send</span>
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}

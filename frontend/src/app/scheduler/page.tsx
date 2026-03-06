"use client";

import { useUser } from "@/lib/UserContext";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import MetricCard from "@/components/layout/MetricCard";
import { ErrorBanner, DemoBadge } from "@/components/ui/Skeleton";

const demoSchedule = [
    { time: "08:00 – 09:30", task: "Implement LSTM Energy Model", difficulty: 8, priority: 5, confidence: 0.87, energy: 7.8, status: "done" },
    { time: "09:30 – 10:00", task: "Team Standup Meeting", difficulty: 2, priority: 2, confidence: 0.92, energy: 8.2, status: "done" },
    { time: "10:00 – 11:30", task: "Research Transformer Architectures", difficulty: 7, priority: 4, confidence: 0.81, energy: 8.5, status: "in_progress" },
    { time: "11:30 – 12:00", task: "Review PR #42", difficulty: 4, priority: 3, confidence: 0.88, energy: 7.9, status: "pending" },
    { time: "13:00 – 14:30", task: "Write System Design Doc", difficulty: 6, priority: 4, confidence: 0.74, energy: 6.2, status: "pending" },
    { time: "14:30 – 15:00", task: "🧘 Recovery Break", difficulty: 0, priority: 0, confidence: 1.0, energy: 5.5, status: "break" },
    { time: "15:00 – 16:00", task: "Update README Documentation", difficulty: 4, priority: 2, confidence: 0.78, energy: 6.5, status: "pending" },
    { time: "16:00 – 17:30", task: "Optimize Database Queries", difficulty: 7, priority: 4, confidence: 0.69, energy: 7.0, status: "pending" },
];

const statusStyles: Record<string, string> = {
    done: "badge-success",
    in_progress: "badge-info",
    pending: "badge-warning",
    break: "bg-violet-900/50 text-violet-300 border border-violet-700/30",
};

const statusLabels: Record<string, string> = {
    done: "Completed",
    in_progress: "In Progress",
    pending: "Scheduled",
    break: "Break",
};

export default function SchedulerPage() {
    const { userId } = useUser();

    const { data: scheduleData, error, refetch } = useApi(
        async () => {
            if (!userId) throw new Error("no user");
            const schedule: any = await api.getSchedule(userId);
            if (!schedule?.entries?.length) return demoSchedule;
            return schedule.entries.map((entry: any) => ({
                time: `${String(entry.time_slot_start_hour).padStart(2, "0")}:00 – ${String(entry.time_slot_end_hour).padStart(2, "0")}:00`,
                task: entry.task_title,
                difficulty: 5,
                priority: 3,
                confidence: entry.confidence || 0.5,
                energy: entry.predicted_energy || 6.0,
                status: "pending",
            }));
        },
        demoSchedule,
        [userId]
    );

    const isDemo = !!error;

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">
                    RL <span className="gradient-text">Scheduler</span>
                </h1>
                {isDemo && <DemoBadge />}
            </div>
            <p className="text-gray-500 -mt-6 text-sm">Deep Q-Network agent · Energy-difficulty matching · Identity-aligned ordering</p>

            {isDemo && <ErrorBanner message="Using simulated schedule" />}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard title="Strategy" value="Greedy" icon="🤖" color="violet" subtitle="DQN pending training" />
                <MetricCard title="Schedule Score" value="0.82" icon="📋" color="green" subtitle="good" />
                <MetricCard title="Tasks Scheduled" value={String((scheduleData || []).filter((s: any) => s.status !== "break").length)} icon="✓" color="cyan" />
                <MetricCard title="Breaks Inserted" value={String((scheduleData || []).filter((s: any) => s.status === "break").length)} icon="🧘" color="amber" subtitle="burnout prevention" />
            </div>

            <div className="glass-card overflow-hidden">
                <div className="p-6 border-b border-white/5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="section-title">Today&apos;s Optimized Schedule</h2>
                            <p className="text-xs text-gray-500 mt-1">Tasks ordered by RL agent · Energy-matched time slots</p>
                        </div>
                        <button
                            onClick={async () => {
                                if (userId) {
                                    try {
                                        await api.optimizeSchedule(userId);
                                        refetch();
                                    } catch { }
                                }
                            }}
                            className="px-4 py-2 rounded-xl bg-aurora-700/20 border border-aurora-700/30 text-aurora-400 text-sm font-medium hover:bg-aurora-700/30 transition-colors"
                        >
                            Re-optimize
                        </button>
                    </div>
                </div>

                <div className="divide-y divide-white/5">
                    {(scheduleData || demoSchedule).map((item: any, i: number) => (
                        <div key={i} className={`flex items-center gap-6 px-6 py-4 transition-colors hover:bg-white/[0.02] ${item.status === "break" ? "bg-violet-950/10" : ""}`}>
                            <div className="w-32 shrink-0">
                                <span className="font-mono text-sm text-gray-400">{item.time}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-200 truncate">{item.task}</p>
                                {item.status !== "break" && (
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-[10px] text-gray-500">Difficulty: {item.difficulty}/10</span>
                                        <span className="text-[10px] text-gray-500">Priority: {"★".repeat(item.priority)}{"☆".repeat(5 - item.priority)}</span>
                                    </div>
                                )}
                            </div>
                            {item.status !== "break" && (
                                <div className="w-20 text-center">
                                    <span className={`font-mono text-sm ${item.energy >= 7 ? "text-emerald-400" : item.energy >= 4 ? "text-amber-400" : "text-rose-400"}`}>
                                        ⚡ {item.energy}
                                    </span>
                                </div>
                            )}
                            <div className="w-20 text-center">
                                <div className="inline-flex items-center gap-1">
                                    <div className="w-12 h-1.5 bg-surface-400 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full bg-aurora-500" style={{ width: `${item.confidence * 100}%` }} />
                                    </div>
                                    <span className="text-[10px] text-gray-500 font-mono">{(item.confidence * 100).toFixed(0)}%</span>
                                </div>
                            </div>
                            <div className="w-24 text-right">
                                <span className={`badge ${statusStyles[item.status]}`}>{statusLabels[item.status]}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="glass-card p-6">
                <h2 className="section-title mb-4">Reward Function Components</h2>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    {[
                        { label: "Completion", weight: "+1.0", desc: "Task finished", color: "text-emerald-400" },
                        { label: "Alignment", weight: "+0.5", desc: "Identity match", color: "text-aurora-400" },
                        { label: "Priority", weight: "+0.3", desc: "High-priority done", color: "text-cyan-400" },
                        { label: "Burnout", weight: "−1.5", desc: "Risk penalty", color: "text-rose-400" },
                        { label: "Overload", weight: "−1.0", desc: "Energy mismatch", color: "text-amber-400" },
                    ].map((r, i) => (
                        <div key={i} className="text-center p-3 rounded-xl bg-surface-400/30">
                            <span className={`font-mono text-xl font-bold ${r.color}`}>{r.weight}</span>
                            <p className="text-xs text-gray-300 mt-1 font-medium">{r.label}</p>
                            <p className="text-[10px] text-gray-600 mt-0.5">{r.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

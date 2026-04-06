"use client";

import { useState } from "react";
import { useUser } from "@/lib/UserContext";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import MetricCard from "@/components/layout/MetricCard";
import { ErrorBanner, DemoBadge, ChartSkeleton, MetricSkeleton, TableSkeleton } from "@/components/ui/Skeleton";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

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
    break: "bg-tertiary/15 text-tertiary border border-tertiary/30",
};

const statusLabels: Record<string, string> = {
    done: "Completed",
    in_progress: "In Progress",
    pending: "Scheduled",
    break: "Break",
};

const categories = ["coding", "writing", "meetings", "planning", "research", "review", "devops"];

export default function SchedulerPage() {
    const { userId } = useUser();
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        difficulty: 5,
        estimated_minutes: 60,
        priority: 3,
        category: "coding",
    });

    const { data: scheduleData, error, refetch, loading: scheduleLoading } = useApi(
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

    const { data: tasks, refetch: refetchTasks, loading: tasksLoading } = useApi(
        async () => {
            if (!userId) throw new Error("no user");
            return await api.getTasks(userId) as any[];
        },
        [],
        [userId]
    );

    const isDemo = !!error;
    const loading = scheduleLoading || tasksLoading;

    async function handleCreateTask(e: React.FormEvent) {
        e.preventDefault();
        if (!userId || !formData.title.trim()) return;
        setSaving(true);
        try {
            await api.createTask({
                user_id: userId,
                ...formData,
            });
            setFormData({ title: "", description: "", difficulty: 5, estimated_minutes: 60, priority: 3, category: "coding" });
            setShowForm(false);
            refetchTasks();
        } catch (err) {
            console.error("Failed to create task:", err);
        } finally {
            setSaving(false);
        }
    }

    const bestFocusWindow = (scheduleData || demoSchedule).reduce((max: any, cur: any) => cur.energy > max.energy && cur.status !== "break" ? cur : max, (scheduleData || demoSchedule)[0]);
    const nextTask = (scheduleData || demoSchedule).find((s: any) => s.status !== "done" && s.status !== "break") || (scheduleData || demoSchedule)[0];

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-on-surface">
                    Task Journey
                </h1>
                {isDemo && <DemoBadge />}
            </div>

            {isDemo && <ErrorBanner message="Using simulated schedule data" />}

            {loading && (!tasks || (tasks as any[]).length === 0) ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <MetricSkeleton />
                    <MetricSkeleton />
                    <MetricSkeleton />
                    <div className="lg:col-span-3">
                        <TableSkeleton rows={4} />
                    </div>
                </div>
            ) : (!isDemo && (!tasks || (tasks as any[]).length === 0)) ? (
                <ScrollReveal className="glass-panel p-12 text-center rounded-xl border border-white/5 flex flex-col items-center gap-4">
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 animate-pulse">check_circle</span>
                    <h3 className="text-lg font-medium text-on-surface">No tasks</h3>
                    <p className="text-sm text-on-surface-variant">No missions loaded yet. Add your first task below.</p>
                </ScrollReveal>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Add a Task */}
                <ScrollReveal index={0} className="glass-panel p-6 rounded-xl border border-white/5 flex flex-col justify-between">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-xl">➕</span>
                        <span className="text-sm font-medium text-on-surface-variant">Add a Task</span>
                    </div>
                    <form onSubmit={handleCreateTask} className="flex flex-col gap-4">
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="What do you need to do?"
                            required
                            className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline text-on-surface text-sm placeholder-on-surface-variant/40 focus:outline-none focus:border-primary transition-all"
                        />
                        <div className="flex items-center justify-between bg-surface-container rounded-xl p-1 border border-outline">
                            {["Easy", "Medium", "Hard"].map((diff, i) => {
                                const vals = [3, 5, 8];
                                const isSelected = formData.difficulty === vals[i];
                                return (
                                    <button
                                        key={diff}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, difficulty: vals[i] })}
                                        className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${isSelected ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                                    >
                                        {diff}
                                    </button>
                                );
                            })}
                        </div>
                        <div>
                            <div className="flex justify-between items-center text-xs text-on-surface-variant mb-2">
                                <span>Duration</span>
                                <span>{formData.estimated_minutes} mins</span>
                            </div>
                            <input
                                type="range"
                                min={15}
                                max={240}
                                step={15}
                                value={formData.estimated_minutes}
                                onChange={(e) => setFormData({ ...formData, estimated_minutes: +e.target.value })}
                                className="w-full h-2 rounded-lg appearance-none bg-surface-container accent-primary"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={saving || !formData.title.trim()}
                            className="w-full py-2.5 mt-2 rounded-xl bg-primary/20 text-primary hover:bg-primary/30 disabled:opacity-40 text-sm font-semibold transition-all outline-none"
                        >
                            {saving ? "Adding..." : "Add to List"}
                        </button>
                    </form>
                </ScrollReveal>

                {/* Best Focus Time */}
                <ScrollReveal index={1} className="glass-panel p-6 rounded-xl border border-white/5 flex flex-col justify-center items-center text-center">
                    <span className="text-3xl mb-3">🔋</span>
                    <h3 className="text-lg font-bold text-on-surface mb-1">Your best focus window</h3>
                    <p className="text-primary font-mono text-xl tracking-wide">{bestFocusWindow ? bestFocusWindow.time : "10:00 – 12:00"}</p>
                    <span className="text-xs text-on-surface-variant mt-2">Based on your highest energy forecasts</span>
                </ScrollReveal>

                {/* Aurora's Suggestion */}
                <ScrollReveal index={2} className="glass-panel p-6 rounded-xl border border-white/5 flex flex-col justify-center items-center text-center">
                    <span className="text-3xl mb-3">🤖</span>
                    <h3 className="text-lg font-bold text-on-surface mb-1">Aurora's Suggestion</h3>
                    <p className="text-sm text-on-surface-variant px-4">Start with <strong className="text-secondary">{nextTask?.task || "your hardest task"}</strong> at {nextTask?.time.split(" ")[0] || "10:00"} when your energy peaks.</p>
                </ScrollReveal>

                {/* Tasks List */}
                <ScrollReveal index={3} className="glass-panel rounded-xl border border-white/5 lg:col-span-3">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">✅</span>
                            <span className="text-sm font-medium text-on-surface-variant">My Tasks Today</span>
                        </div>
                        <span className="text-xs text-on-surface-variant bg-surface-container px-2 py-1 rounded-md">{(tasks as any[])?.length || 0} Total</span>
                    </div>
                    <div className="divide-y divide-white/5 max-h-[300px] overflow-y-auto">
                        {((tasks as any[])?.length > 0 ? (tasks as any[]) : []).map((task: any) => (
                            <div key={task.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors">
                                <button
                                    onClick={async () => {
                                        const next: Record<string, string> = { pending: "in_progress", in_progress: "done", done: "pending" };
                                        try {
                                            await api.updateTaskStatus(task.id, next[task.status] || "pending");
                                            refetchTasks();
                                        } catch { }
                                    }}
                                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors shrink-0 ${task.status === "done" ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : task.status === "in_progress" ? "bg-primary/20 border-primary" : "border-outline hover:border-on-surface-variant"}`}
                                >
                                    {task.status === "done" && "✓"}
                                </button>
                                <p className={`flex-1 text-sm ${task.status === "done" ? "text-on-surface-variant line-through" : "text-on-surface"}`}>{task.title}</p>
                                <span className={`text-xs px-2 py-1 rounded-md ${task.difficulty >= 8 ? 'bg-rose-500/10 text-rose-400' : task.difficulty >= 5 ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                    {task.estimated_minutes} min
                                </span>
                            </div>
                        ))}
                        {(!isDemo && (!tasks || (tasks as any[]).length === 0)) && (
                            <div className="px-6 py-12 text-center text-sm text-on-surface-variant">No tasks scheduled for today.</div>
                        )}
                    </div>
                </ScrollReveal>
            </div>
            )}

            {/* Global Action */}
            <ScrollReveal index={4}>
                <button
                    onClick={async () => {
                        if (userId) {
                            try {
                                await api.optimizeSchedule(userId);
                                refetch();
                            } catch { }
                        }
                    }}
                    className={`w-full py-4 rounded-xl text-on-primary text-lg font-bold tracking-wide outline-none focus-visible:outline-2 focus-visible:outline-primary active:scale-95 transition-all duration-200 bg-primary hover:bg-primary-dim shadow-glow`}
                >
                    Optimize My Schedule
                </button>
            </ScrollReveal>
        </div>
    );
}

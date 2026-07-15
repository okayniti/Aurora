"use client";

import { useState } from "react";
import { useUser } from "@/lib/UserContext";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import { DemoBadge, ErrorBanner } from "@/components/ui/Skeleton";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export default function CalendarPage() {
    const { userId } = useUser();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

    // Fetch tasks dynamically from API
    const { data: tasks, error } = useApi<any[]>(
        async () => {
            if (!userId) throw new Error("no user");
            return await api.getTasks(userId) as any[];
        },
        [],
        [userId]
    );

    const isDemo = !!error;

    // Helper functions for month rendering
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
    const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const prevMonthDays = getDaysInMonth(year, month - 1);

    const calendarCells: { date: Date; isCurrentMonth: boolean }[] = [];

    // Fill previous month overlap days
    for (let i = firstDay - 1; i >= 0; i--) {
        calendarCells.push({
            date: new Date(year, month - 1, prevMonthDays - i),
            isCurrentMonth: false,
        });
    }

    // Fill current month days
    for (let i = 1; i <= daysInMonth; i++) {
        calendarCells.push({
            date: new Date(year, month, i),
            isCurrentMonth: true,
        });
    }

    // Fill next month overlap days
    const totalCells = 42; // 6 rows * 7 days
    const nextDaysNeeded = totalCells - calendarCells.length;
    for (let i = 1; i <= nextDaysNeeded; i++) {
        calendarCells.push({
            date: new Date(year, month + 1, i),
            isCurrentMonth: false,
        });
    }

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    // Filter tasks for a specific date
    const getTasksForDate = (date: Date) => {
        if (!tasks) return [];
        return tasks.filter((task: any) => {
            const taskDate = new Date(task.scheduled_start || task.created_at);
            return (
                taskDate.getDate() === date.getDate() &&
                taskDate.getMonth() === date.getMonth() &&
                taskDate.getFullYear() === date.getFullYear()
            );
        });
    };

    const selectedTasks = selectedDate ? getTasksForDate(selectedDate) : [];

    // Months labels
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div className="space-y-8 animate-fade-in w-full">
            <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-on-surface">
                    Cognitive Calendar
                </h1>
                {isDemo && <DemoBadge />}
            </div>

            {isDemo && <ErrorBanner message="Using simulated offline tasks data" />}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start w-full">
                {/* Calendar Grid (lg:col-span-2) */}
                <ScrollReveal index={0} className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/5 space-y-6">
                    <div className="flex justify-between items-center px-2">
                        <h2 className="text-xl font-bold text-on-surface">
                            {months[month]} <span className="text-primary font-mono">{year}</span>
                        </h2>
                        <div className="flex gap-2">
                            <button
                                onClick={prevMonth}
                                className="w-10 h-10 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface transition-all flex items-center justify-center border border-white/5"
                            >
                                ◀
                            </button>
                            <button
                                onClick={nextMonth}
                                className="w-10 h-10 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface transition-all flex items-center justify-center border border-white/5"
                            >
                                ▶
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                        <div>Sun</div>
                        <div>Mon</div>
                        <div>Tue</div>
                        <div>Wed</div>
                        <div>Thu</div>
                        <div>Fri</div>
                        <div>Sat</div>
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                        {calendarCells.map((cell, idx) => {
                            const dateTasks = getTasksForDate(cell.date);
                            const taskCount = dateTasks.length;
                            const isSelected = selectedDate &&
                                selectedDate.getDate() === cell.date.getDate() &&
                                selectedDate.getMonth() === cell.date.getMonth() &&
                                selectedDate.getFullYear() === cell.date.getFullYear();
                            
                            // Determine cell vibe (high completion = green, some tasks = purple, none = transparent)
                            const doneCount = dateTasks.filter((t: any) => t.status === "done").length;
                            const isFlowState = taskCount > 0 && doneCount === taskCount;
                            const hasActiveTasks = taskCount > 0 && doneCount < taskCount;

                            return (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedDate(cell.date)}
                                    className={`
                                        relative aspect-square rounded-2xl p-2 flex flex-col justify-between items-center transition-all duration-300 border outline-none
                                        ${cell.isCurrentMonth ? "text-on-surface" : "text-on-surface-variant/20"}
                                        ${isSelected 
                                            ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(204,151,255,0.15)] scale-95" 
                                            : "border-white/5 hover:bg-white/5"
                                        }
                                        ${isFlowState && !isSelected ? "bg-emerald-500/5 border-emerald-500/20" : ""}
                                        ${hasActiveTasks && !isSelected ? "bg-primary/5 border-primary/10" : ""}
                                    `}
                                >
                                    <span className="text-sm font-mono font-medium self-start">{cell.date.getDate()}</span>
                                    
                                    {/* Task Indicators */}
                                    {taskCount > 0 && (
                                        <div className="flex gap-1 justify-center w-full pb-1">
                                            {dateTasks.slice(0, 3).map((task: any, tIdx: number) => (
                                                <span 
                                                    key={tIdx} 
                                                    className={`w-1.5 h-1.5 rounded-full ${task.status === "done" ? "bg-emerald-400" : "bg-primary"}`} 
                                                />
                                            ))}
                                            {taskCount > 3 && (
                                                <span className="text-[8px] text-on-surface-variant leading-none font-bold">+</span>
                                            )}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </ScrollReveal>

                {/* Day Details Pane (lg:col-span-1) */}
                <ScrollReveal index={1} className="lg:col-span-1 flex flex-col gap-6 w-full">
                    <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6">
                        <div className="flex flex-col">
                            <span className="text-xs uppercase tracking-widest text-on-surface-variant">Focus Agenda</span>
                            <span className="text-lg font-bold text-secondary font-mono">
                                {selectedDate ? selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }) : "Select a day"}
                            </span>
                        </div>

                        <div className="space-y-4">
                            {selectedTasks.length > 0 ? (
                                selectedTasks.map((task: any) => (
                                    <div 
                                        key={task.id} 
                                        className="p-4 rounded-xl bg-surface-container border border-white/5 hover:border-white/10 transition-all space-y-3"
                                    >
                                        <div className="flex justify-between items-start gap-2">
                                            <h4 className={`text-sm font-medium ${task.status === "done" ? "line-through text-on-surface-variant" : "text-on-surface"}`}>
                                                {task.title}
                                            </h4>
                                            <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-mono font-semibold ${
                                                task.status === "done" 
                                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                                    : task.status === "in_progress" 
                                                        ? "bg-primary/10 text-primary border border-primary/20" 
                                                        : "bg-surface-container-high text-on-surface-variant border border-white/5"
                                            }`}>
                                                {task.status.replace("_", " ")}
                                            </span>
                                        </div>
                                        {task.description && (
                                            <p className="text-xs text-on-surface-variant line-clamp-2">{task.description}</p>
                                        )}
                                        <div className="flex justify-between items-center text-[10px] text-on-surface-variant">
                                            <span className="font-mono">Est: {task.estimated_minutes} min</span>
                                            {task.category && (
                                                <span className="px-1.5 py-0.2 rounded bg-white/5 font-semibold text-primary">{task.category}</span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-16 space-y-3 flex flex-col items-center">
                                    <span className="text-3xl text-on-surface-variant/20">☕</span>
                                    <h4 className="text-sm font-bold text-on-surface">No tasks scheduled</h4>
                                    <p className="text-xs text-on-surface-variant max-w-[200px] mx-auto">This day is wide open. Good time for deep focus recovery.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </ScrollReveal>
            </div>
        </div>
    );
}

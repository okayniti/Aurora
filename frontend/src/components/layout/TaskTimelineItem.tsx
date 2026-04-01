"use client";

import React, { memo } from "react";

interface TaskTimelineItemProps {
    task: { status: "active" | "done" | "upcoming"; time: string; title: string; desc: string };
}

export const TaskTimelineItem = memo(function TaskTimelineItem({ task }: TaskTimelineItemProps) {
    return (
        <div
            className={`group relative pl-12 transition-all duration-500 ${
                task.status === "upcoming" ? "opacity-40 hover:opacity-80" : ""
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
    );
});

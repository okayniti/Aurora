"use client";

import { MetricSkeleton, ChartSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
    return (
        <div className="space-y-8 animate-fade-in text-on-surface">
            <div className="flex items-center gap-3 mb-2">
                <div className="h-9 w-64 bg-surface-container rounded-lg animate-pulse" />
            </div>
            <div className="h-4 w-96 bg-surface-container-low rounded-lg animate-pulse -mt-4 mb-4" />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricSkeleton />
                <MetricSkeleton />
                <MetricSkeleton />
                <MetricSkeleton />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <ChartSkeleton height="h-[380px]" />
                </div>
                <div className="glass-panel p-6 rounded-xl border border-white/5 space-y-4 animate-pulse">
                    <div className="h-6 w-32 bg-surface-container-low rounded" />
                    <div className="h-32 w-full bg-surface-container rounded-lg" />
                    <div className="h-10 w-full bg-surface-container rounded-lg" />
                </div>
            </div>
        </div>
    );
}

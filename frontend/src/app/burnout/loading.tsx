"use client";

import { MetricSkeleton, ChartSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
    return (
        <div className="space-y-8 animate-fade-in text-on-surface">
            <div className="flex items-center gap-3 mb-2">
                <div className="h-9 w-52 bg-surface-container rounded-lg animate-pulse" />
            </div>
            <div className="h-4 w-72 bg-surface-container-low rounded-lg animate-pulse -mt-4 mb-4" />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricSkeleton />
                <MetricSkeleton />
                <MetricSkeleton />
                <MetricSkeleton />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartSkeleton height="h-[280px]" />
                <ChartSkeleton height="h-[280px]" />
            </div>

            <ChartSkeleton height="h-[200px]" />
        </div>
    );
}

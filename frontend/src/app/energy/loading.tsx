"use client";

import { MetricSkeleton, ChartSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
    return (
        <div className="space-y-8 animate-fade-in text-on-surface">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="h-9 w-64 bg-surface-container rounded-lg animate-pulse mb-2" />
                    <div className="h-4 w-96 bg-surface-container-low rounded-lg animate-pulse" />
                </div>
                <div className="h-10 w-32 bg-surface-container rounded-xl animate-pulse" />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricSkeleton />
                <MetricSkeleton />
                <MetricSkeleton />
                <MetricSkeleton />
            </div>

            <ChartSkeleton height="h-[350px]" />
            <ChartSkeleton height="h-[250px]" />
        </div>
    );
}

"use client";

import { MetricSkeleton, TableSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
    return (
        <div className="space-y-8 animate-fade-in text-on-surface">
            <div className="flex items-center gap-3 mb-2">
                <div className="h-9 w-48 bg-surface-container rounded-lg animate-pulse" />
            </div>
            <div className="h-4 w-[400px] bg-surface-container-low rounded-lg animate-pulse -mt-4 mb-4" />

            {/* Task List Form Spacer */}
            <TableSkeleton rows={3} />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricSkeleton />
                <MetricSkeleton />
                <MetricSkeleton />
                <MetricSkeleton />
            </div>

            {/* Schedule Table Spacer */}
            <TableSkeleton rows={8} />
        </div>
    );
}

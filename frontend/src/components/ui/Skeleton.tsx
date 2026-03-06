"use client";

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
    return (
        <div
            className={`animate-pulse rounded-xl bg-surface-400/50 ${className}`}
        />
    );
}

export function MetricSkeleton() {
    return (
        <div className="glass-card p-5 space-y-3 animate-pulse">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-3 w-28" />
        </div>
    );
}

export function ChartSkeleton({ height = "h-[300px]" }: { height?: string }) {
    return (
        <div className="glass-card p-6 animate-pulse">
            <Skeleton className="h-5 w-48 mb-2" />
            <Skeleton className="h-3 w-64 mb-6" />
            <Skeleton className={`w-full ${height} rounded-xl`} />
        </div>
    );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="glass-card overflow-hidden animate-pulse">
            <div className="p-6 border-b border-white/5">
                <Skeleton className="h-5 w-48 mb-2" />
                <Skeleton className="h-3 w-64" />
            </div>
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex items-center gap-6 px-6 py-4 border-b border-white/5">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                </div>
            ))}
        </div>
    );
}

interface ErrorBannerProps {
    message: string;
    onRetry?: () => void;
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
    return (
        <div className="glass-card p-4 border border-rose-500/20 bg-rose-500/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <span className="text-rose-400 text-lg">⚠</span>
                <div>
                    <p className="text-sm text-rose-300 font-medium">API Unavailable</p>
                    <p className="text-xs text-gray-500">{message} · Showing demo data</p>
                </div>
            </div>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium hover:bg-rose-500/20 transition-colors"
                >
                    Retry
                </button>
            )}
        </div>
    );
}

export function DemoBadge() {
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse-slow" />
            Demo Data
        </span>
    );
}

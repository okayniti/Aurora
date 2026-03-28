"use client";

interface MetricCardProps {
    title: string;
    value: string;
    icon?: string;
    color?: "primary" | "secondary" | "tertiary" | "green" | "cyan" | "amber" | "rose" | "violet" | "error";
    subtitle?: string;
    trend?: "up" | "down" | "flat";
    trendValue?: string;
}

const colorMap: Record<string, string> = {
    primary: "text-primary",
    secondary: "text-secondary",
    tertiary: "text-tertiary",
    green: "text-emerald-400",
    cyan: "text-secondary",
    amber: "text-amber-400",
    rose: "text-error",
    violet: "text-tertiary",
    error: "text-error",
};

export default function MetricCard({
    title,
    value,
    icon,
    color = "primary",
    subtitle,
    trend,
    trendValue,
}: MetricCardProps) {
    const valueColor = colorMap[color] || "text-primary";

    return (
        <div className="glass-panel p-5 rounded-xl border border-white/5 space-y-2 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <span className="label-sm">{title}</span>
                {icon && <span className="text-lg">{icon}</span>}
            </div>
            <div className={`text-2xl font-bold tracking-tight font-mono ${valueColor}`}>
                {value}
                {subtitle && (
                    <span className="text-xs text-on-surface-variant font-normal ml-1">
                        {subtitle}
                    </span>
                )}
            </div>
            {trend && trendValue && (
                <div className="flex items-center gap-1.5 text-xs">
                    <span className={trend === "up" ? "text-emerald-400" : trend === "down" ? "text-error" : "text-on-surface-variant"}>
                        {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}
                    </span>
                    <span className="text-on-surface-variant">{trendValue}</span>
                </div>
            )}
        </div>
    );
}

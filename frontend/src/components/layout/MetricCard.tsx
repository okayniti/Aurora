"use client";

interface MetricCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: "up" | "down" | "neutral";
    trendValue?: string;
    color?: "cyan" | "green" | "amber" | "rose" | "violet" | "default";
    icon?: string;
}

const colorMap = {
    cyan: "from-cyan-500/10 to-transparent border-cyan-500/20 text-cyan-400",
    green: "from-emerald-500/10 to-transparent border-emerald-500/20 text-emerald-400",
    amber: "from-amber-500/10 to-transparent border-amber-500/20 text-amber-400",
    rose: "from-rose-500/10 to-transparent border-rose-500/20 text-rose-400",
    violet: "from-violet-500/10 to-transparent border-violet-500/20 text-violet-400",
    default: "from-aurora-500/10 to-transparent border-aurora-500/20 text-aurora-400",
};

export default function MetricCard({
    title,
    value,
    subtitle,
    trend,
    trendValue,
    color = "default",
    icon,
}: MetricCardProps) {
    const colorClass = colorMap[color];

    return (
        <div
            className={`glass-card-hover p-5 bg-gradient-to-br ${colorClass} animate-fade-in-up group`}
        >
            <div className="flex items-start justify-between mb-3">
                <span className="metric-label">{title}</span>
                {icon && (
                    <span className="text-xl opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
                        {icon}
                    </span>
                )}
            </div>

            <div className="metric-value mb-1 animate-count-up">{value}</div>

            {(subtitle || trendValue) && (
                <div className="flex items-center gap-2 mt-2">
                    {trendValue && (
                        <span
                            className={`text-xs font-medium ${trend === "up"
                                ? "text-emerald-400"
                                : trend === "down"
                                    ? "text-rose-400"
                                    : "text-gray-500"
                                }`}
                        >
                            {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}{" "}
                            {trendValue}
                        </span>
                    )}
                    {subtitle && (
                        <span className="text-xs text-gray-500">{subtitle}</span>
                    )}
                </div>
            )}
        </div>
    );
}

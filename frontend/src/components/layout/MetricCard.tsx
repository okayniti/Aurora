"use client";

import React, { memo } from "react";
import { NumberTicker } from "@/components/ui/NumberTicker";

interface MetricCardProps {
    title: string;
    value: string;
    icon?: string;
    color?: "primary" | "secondary" | "tertiary" | "green" | "cyan" | "amber" | "rose" | "violet" | "error";
    subtitle?: string;
    trend?: "up" | "down" | "flat";
    trendValue?: string;
    animateValue?: number;
    animateDecimals?: number;
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

export default memo(function MetricCard({
    title,
    value,
    icon,
    color = "primary",
    subtitle,
    trend,
    trendValue,
    animateValue,
    animateDecimals = 0,
}: MetricCardProps) {
    const valueColor = colorMap[color] || "text-primary";

    let displayValue: React.ReactNode = value;
    if (animateValue !== undefined) {
        const match = value.match(/^([^\d]*)([\d.]+)(.*)$/);
        const prefix = match?.[1] || "";
        const suffix = match?.[3] || "";
        displayValue = (
            <NumberTicker
                value={animateValue}
                decimals={animateDecimals}
                prefix={prefix}
                suffix={suffix}
                duration={1400}
            />
        );
    }

    return (
        <div className="glass-panel p-5 rounded-xl border border-white/5 space-y-2 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <span className="label-sm">{title}</span>
                {icon && <span className="text-lg">{icon}</span>}
            </div>
            <div className={`text-2xl font-bold tracking-tight font-mono ${valueColor}`}>
                {displayValue}
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
});

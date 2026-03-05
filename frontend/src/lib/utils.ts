// AURORA Utilities
export function formatPercentage(value: number): string {
    return `${(value * 100).toFixed(1)}%`;
}

export function formatHours(hours: number): string {
    return `${hours.toFixed(1)}h`;
}

export function getRiskColor(level: string): string {
    switch (level) {
        case "low": return "#34d399";
        case "moderate": return "#fbbf24";
        case "high": return "#fb7185";
        case "critical": return "#ef4444";
        default: return "#9ca3af";
    }
}

export function getEnergyColor(value: number): string {
    if (value >= 7) return "#34d399";
    if (value >= 4) return "#fbbf24";
    return "#fb7185";
}

export function cn(...classes: (string | undefined | false)[]): string {
    return classes.filter(Boolean).join(" ");
}

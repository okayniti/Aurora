"use client";

import { ReactNode } from "react";

interface ShimmerButtonProps {
    children: ReactNode;
    onClick?: () => void;
    className?: string;
    shimmerColor?: string;
    variant?: "primary" | "ghost";
}

export function ShimmerButton({
    children,
    onClick,
    className = "",
    shimmerColor = "rgba(204, 151, 255, 0.3)",
    variant = "primary",
}: ShimmerButtonProps) {
    const base =
        variant === "primary"
            ? "bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
            : "border border-white/5 text-on-surface-variant hover:text-on-surface hover:border-white/10";

    return (
        <button
            onClick={onClick}
            className={`relative overflow-hidden px-5 py-2.5 min-h-[44px] rounded-full text-[0.625rem] uppercase tracking-widest transition-all duration-300 outline-none active:scale-95 ${base} ${className}`}
        >
            {/* Shimmer sweep */}
            <span
                className="absolute inset-0 -translate-x-full animate-[shimmerSweep_3s_ease-in-out_infinite]"
                style={{
                    background: `linear-gradient(90deg, transparent, ${shimmerColor}, transparent)`,
                }}
            />
            <span className="relative z-10">{children}</span>
        </button>
    );
}

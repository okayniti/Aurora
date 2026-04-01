"use client";

import React, { memo } from "react";
import dynamic from "next/dynamic";
import { ShimmerButton } from "@/components/ui/ShimmerButton";

const CardTilt = dynamic(() => import("@/components/ui/CardTilt").then(m => m.CardTilt), { ssr: false });

interface InsightCardProps {
    neuralMessage: string;
    onRetry?: () => void;
    hasError?: boolean;
}

export const InsightCard = memo(function InsightCard({ neuralMessage, onRetry, hasError }: InsightCardProps) {
    return (
        <CardTilt>
            <div className="glass-panel p-5 md:p-8 rounded-xl border border-primary/10 shadow-xl space-y-4">
                <div className="flex items-center gap-3 text-primary">
                    <span className="material-symbols-outlined text-lg">psychology</span>
                    <span className="label-sm !text-primary !tracking-widest">
                        Neural Insight
                    </span>
                    {hasError && onRetry && (
                        <button onClick={onRetry} className="ml-auto text-amber-400 text-[10px] px-2 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20">
                            ↻ retry
                        </button>
                    )}
                </div>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                    {neuralMessage}
                </p>
                <div className="flex gap-4 pt-4">
                    <ShimmerButton variant="primary">Proceed</ShimmerButton>
                    <ShimmerButton variant="ghost">Dismiss</ShimmerButton>
                </div>
            </div>
        </CardTilt>
    );
});

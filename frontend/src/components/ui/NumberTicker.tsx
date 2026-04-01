"use client";

import { useEffect, useRef, useState } from "react";

interface NumberTickerProps {
    value: number;
    /** Decimal places to show */
    decimals?: number;
    /** Duration in ms */
    duration?: number;
    /** Prefix like $ or % */
    prefix?: string;
    suffix?: string;
    className?: string;
}

export function NumberTicker({
    value,
    decimals = 0,
    duration = 1200,
    prefix = "",
    suffix = "",
    className = "",
}: NumberTickerProps) {
    const [display, setDisplay] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        if (hasAnimated.current) {
            setDisplay(value);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated.current) {
                    hasAnimated.current = true;
                    const startTime = performance.now();
                    const animate = (now: number) => {
                        const elapsed = now - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        // Ease out cubic
                        const eased = 1 - Math.pow(1 - progress, 3);
                        setDisplay(eased * value);
                        if (progress < 1) requestAnimationFrame(animate);
                    };
                    requestAnimationFrame(animate);
                }
            },
            { threshold: 0.1 }
        );

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [value, duration]);

    return (
        <span ref={ref} className={`tabular-nums ${className}`}>
            {prefix}
            {display.toFixed(decimals)}
            {suffix}
        </span>
    );
}

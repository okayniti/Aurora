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
    useEffect(() => {
        let isAnimating = false;
        
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !isAnimating) {
                    isAnimating = true;
                    // Animate from current display to the new requested value
                    const startTime = performance.now();
                    const startValue = display;
                    const diff = value - startValue;

                    const animate = (now: number) => {
                        const elapsed = now - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3);
                        setDisplay(startValue + eased * diff);
                        
                        if (progress < 1) {
                            requestAnimationFrame(animate);
                        } else {
                            isAnimating = false;
                        }
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

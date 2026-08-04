"use client";

import { useRef, useState, useEffect } from "react";

interface SpotlightProps {
    className?: string;
    color?: string;
    size?: number;
    opacity?: number;
}

export function Spotlight({
    className = "",
    color = "rgba(204, 151, 255, 0.08)",
    size = 600,
    opacity = 1,
}: SpotlightProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    // Latest raw mouse coords, written on every event but only read once per
    // animation frame — this is what actually throttles the render rate.
    const targetRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const handleMouse = (e: MouseEvent) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            targetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        };

        let raf: number;
        const loop = () => {
            setPosition((prev) => ({
                x: prev.x + (targetRef.current.x - prev.x) * 0.08,
                y: prev.y + (targetRef.current.y - prev.y) * 0.08,
            }));
            raf = requestAnimationFrame(loop);
        };

        window.addEventListener("mousemove", handleMouse);
        raf = requestAnimationFrame(loop);

        return () => {
            window.removeEventListener("mousemove", handleMouse);
            cancelAnimationFrame(raf);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className={`absolute inset-0 overflow-hidden pointer-events-none -z-10 ${className}`}
            style={{ opacity }}
        >
            <div
                className="absolute rounded-full"
                style={{
                    width: size,
                    height: size,
                    left: position.x - size / 2,
                    top: position.y - size / 2,
                    background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
                    filter: "blur(40px)",
                }}
            />
        </div>
    );
}

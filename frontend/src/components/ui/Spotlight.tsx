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

    useEffect(() => {
        const handleMouse = (e: MouseEvent) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            // Lerp towards mouse for smooth trailing
            setPosition((prev) => ({
                x: prev.x + (e.clientX - rect.left - prev.x) * 0.08,
                y: prev.y + (e.clientY - rect.top - prev.y) * 0.08,
            }));
        };

        let raf: number;
        const loop = () => {
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
                className="absolute rounded-full transition-[left,top] duration-[2000ms] ease-out"
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

"use client";

import { useRef, ReactNode } from "react";

interface CardTiltProps {
    children: ReactNode;
    className?: string;
    maxTilt?: number;
    glareOpacity?: number;
}

export function CardTilt({
    children,
    className = "",
    maxTilt = 8,
    glareOpacity = 0.06,
}: CardTiltProps) {
    const ref = useRef<HTMLDivElement>(null);
    const glareRef = useRef<HTMLDivElement>(null);

    // Pure visual hover effect — mutate the DOM directly instead of routing
    // every mousemove pixel through React state, which forced a full
    // component re-render on every event (60-120+/sec on a fast mouse).
    function handleMouseMove(e: React.MouseEvent) {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const rotateX = (0.5 - y) * maxTilt;
        const rotateY = (x - 0.5) * maxTilt;
        ref.current.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        if (glareRef.current) {
            glareRef.current.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,${glareOpacity}), transparent 60%)`;
        }
    }

    function handleMouseLeave() {
        if (!ref.current) return;
        ref.current.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
        if (glareRef.current) {
            glareRef.current.style.background = `radial-gradient(circle at 50% 50%, rgba(255,255,255,${glareOpacity}), transparent 60%)`;
        }
    }

    return (
        <div
            ref={ref}
            className={`relative transition-transform duration-300 ease-out ${className}`}
            style={{ transformStyle: "preserve-3d" }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {children}
            {/* Glare overlay */}
            <div
                ref={glareRef}
                className="absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-300"
            />
        </div>
    );
}

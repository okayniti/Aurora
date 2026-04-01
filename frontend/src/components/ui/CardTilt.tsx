"use client";

import { useRef, useState, ReactNode } from "react";

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
    const [transform, setTransform] = useState("perspective(800px) rotateX(0deg) rotateY(0deg)");
    const [glare, setGlare] = useState({ x: 50, y: 50 });

    function handleMouseMove(e: React.MouseEvent) {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const rotateX = (0.5 - y) * maxTilt;
        const rotateY = (x - 0.5) * maxTilt;
        setTransform(`perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
        setGlare({ x: x * 100, y: y * 100 });
    }

    function handleMouseLeave() {
        setTransform("perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
        setGlare({ x: 50, y: 50 });
    }

    return (
        <div
            ref={ref}
            className={`relative transition-transform duration-300 ease-out ${className}`}
            style={{ transform, transformStyle: "preserve-3d" }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {children}
            {/* Glare overlay */}
            <div
                className="absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-300"
                style={{
                    background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glareOpacity}), transparent 60%)`,
                }}
            />
        </div>
    );
}

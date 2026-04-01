"use client";

interface AnimatedGradientTextProps {
    children: React.ReactNode;
    className?: string;
    colors?: string[];
    speed?: number;
}

export function AnimatedGradientText({
    children,
    className = "",
    colors = ["#cc97ff", "#3adffa", "#9093ff", "#cc97ff"],
    speed = 4,
}: AnimatedGradientTextProps) {
    return (
        <span
            className={`bg-clip-text text-transparent ${className}`}
            style={{
                backgroundImage: `linear-gradient(90deg, ${colors.join(", ")})`,
                backgroundSize: "300% 100%",
                animation: `gradientShift ${speed}s ease-in-out infinite`,
            }}
        >
            {children}
        </span>
    );
}

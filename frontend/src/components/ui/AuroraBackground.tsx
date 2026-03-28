"use client";

/**
 * AuroraBackground — Fixed atmospheric gradient orbs
 * Creates the "Celestial Observer" effect from DESIGN.md
 */
export default function AuroraBackground() {
    return (
        <>
            {/* Main aurora blur orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary aurora-blur" />
                <div className="absolute top-[40%] -right-[5%] w-[40%] h-[60%] rounded-full bg-secondary aurora-blur" />
                <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[40%] rounded-full bg-tertiary aurora-blur" />
            </div>

            {/* Bottom-right ambient glow point */}
            <div className="fixed bottom-0 right-0 w-[40vw] h-[40vw] bg-tertiary/5 rounded-full blur-[150px] pointer-events-none z-0" />
        </>
    );
}

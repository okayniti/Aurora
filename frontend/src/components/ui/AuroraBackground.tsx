"use client";

import { useEffect, useRef } from "react";

/**
 * AuroraBackground — Ambient gradient orbs with scroll parallax
 *
 * Layer 1 (CSS): Each orb drifts with a unique keyframe animation
 * Layer 2 (JS):  A passive scroll listener applies translateY offsets
 *                at different multipliers per orb for parallax depth.
 *
 * Structure: scroll-offset wrapper (JS) → inner orb (CSS drift)
 */

const ORB_CONFIG = [
    {
        // Primary — top-left
        className: "bg-primary",
        position: "-top-[10%] -left-[10%] w-[50%] h-[50%]",
        animClass: "animate-orb-drift-1",
        parallax: 0.08,
    },
    {
        // Secondary — mid-right
        className: "bg-secondary",
        position: "top-[40%] -right-[5%] w-[40%] h-[60%]",
        animClass: "animate-orb-drift-2",
        parallax: 0.14,
    },
    {
        // Tertiary — bottom-left
        className: "bg-tertiary",
        position: "-bottom-[20%] left-[20%] w-[60%] h-[40%]",
        animClass: "animate-orb-drift-3",
        parallax: 0.2,
    },
];

export default function AuroraBackground() {
    const wrapperRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        let ticking = false;

        function onScroll() {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                const y = window.scrollY;
                wrapperRefs.current.forEach((el, i) => {
                    if (el) {
                        el.style.transform = `translateY(${y * ORB_CONFIG[i].parallax}px)`;
                    }
                });
                ticking = false;
            });
        }

        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <>
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                {ORB_CONFIG.map((orb, i) => (
                    /* Layer 2: scroll-offset wrapper (JS-driven translateY) */
                    <div
                        key={i}
                        ref={(el) => { wrapperRefs.current[i] = el; }}
                        className="absolute inset-0 will-change-transform"
                        style={{ transform: "translateY(0)" }}
                    >
                        {/* Layer 1: CSS keyframe drift animation */}
                        <div
                            className={`absolute ${orb.position} rounded-full ${orb.className} aurora-blur ${orb.animClass} will-change-transform`}
                        />
                    </div>
                ))}
            </div>

            {/* Ambient bottom-right glow */}
            <div className="fixed bottom-0 right-0 w-[40vw] h-[40vw] bg-tertiary/5 rounded-full blur-[150px] pointer-events-none z-0" />
        </>
    );
}

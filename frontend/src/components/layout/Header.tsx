"use client";

import { useState, useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface TopBarProps {
    onMenuToggle?: () => void;
}

export default function TopBar({ onMenuToggle }: TopBarProps) {
    const [status, setStatus] = useState<"online" | "offline">("offline");

    useEffect(() => {
        async function checkBackend() {
            try {
                const res = await fetch(`${API_BASE}/api/health`, {
                    signal: AbortSignal.timeout(3000),
                });
                if (res.ok) setStatus("online");
                else setStatus("offline");
            } catch {
                setStatus("offline");
            }
        }
        checkBackend();
        const interval = setInterval(checkBackend, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <header className="fixed top-0 w-full h-20 md:h-24 flex justify-between items-center px-4 md:pl-32 md:pr-8 lg:pr-16 z-40 bg-transparent font-sans tracking-[0.02em] font-light">
            {/* Left: Hamburger (mobile) + Logo */}
            <div className="flex items-center gap-3">
                {/* Hamburger — mobile only */}
                <button
                    onClick={onMenuToggle}
                    className="flex md:hidden items-center justify-center w-11 h-11 rounded-xl text-primary hover:text-secondary hover:bg-white/5 transition-all"
                    aria-label="Open navigation menu"
                >
                    <span className="material-symbols-outlined text-2xl">menu</span>
                </button>

                {/* Logo */}
                <div className="text-2xl md:text-3xl font-black tracking-tighter text-primary drop-shadow-[0_0_15px_rgba(204,151,255,0.4)]">
                    AURORA
                </div>
            </div>

            {/* Right side: status + icons */}
            <div className="flex items-center gap-3 md:gap-6">
                {/* Backend status — dot always, text on sm+ */}
                <div className="flex items-center gap-2 px-2 md:px-3 py-1.5 rounded-full glass-panel border border-primary/10">
                    <span
                        className={`w-2.5 h-2.5 md:w-2 md:h-2 rounded-full animate-pulse ${
                            status === "online"
                                ? "bg-secondary shadow-[0_0_8px_rgba(58,223,250,0.8)]"
                                : "bg-error shadow-[0_0_8px_rgba(255,110,132,0.8)]"
                        }`}
                    />
                    <span className="hidden sm:inline text-[10px] text-on-surface-variant font-mono uppercase tracking-wider">
                        {status === "online" ? "Online" : "Offline"}
                    </span>
                </div>

                {/* Notification icon */}
                <button className="w-11 h-11 flex items-center justify-center rounded-xl text-primary hover:text-secondary hover:blur-[1px] transition-all duration-500">
                    <span className="material-symbols-outlined">notifications_paused</span>
                </button>

                {/* Grid icon — hidden on mobile */}
                <button className="hidden md:flex w-11 h-11 items-center justify-center rounded-xl text-primary hover:text-secondary hover:blur-[1px] transition-all duration-500">
                    <span className="material-symbols-outlined">blur_on</span>
                </button>

                {/* Avatar */}
                <div className="w-10 h-10 md:w-10 md:h-10 rounded-full overflow-hidden border border-primary/20 bg-surface-container-high flex items-center justify-center shrink-0">
                    <span className="text-primary text-lg font-bold">A</span>
                </div>
            </div>
        </header>
    );
}

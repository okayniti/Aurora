"use client";

import { useState, useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function TopBar() {
    const [status, setStatus] = useState<"online" | "offline">("offline");

    useEffect(() => {
        async function checkBackend() {
            try {
                const res = await fetch(`${API_BASE}/api/health`, {
                    signal: AbortSignal.timeout(3000),
                });
                if (res.ok) setStatus("online");
            } catch {
                setStatus("offline");
            }
        }
        checkBackend();
        const interval = setInterval(checkBackend, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <header className="fixed top-0 w-full h-24 flex justify-between items-center px-8 lg:px-16 z-40 bg-transparent font-sans tracking-[0.02em] font-light">
            {/* Logo */}
            <div className="text-3xl font-black tracking-tighter text-primary drop-shadow-[0_0_15px_rgba(204,151,255,0.4)]">
                AURORA
            </div>

            {/* Right side: status + icons */}
            <div className="flex items-center gap-6">
                {/* Backend status */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border border-primary/10">
                    <span
                        className={`w-2 h-2 rounded-full animate-pulse ${
                            status === "online"
                                ? "bg-secondary shadow-[0_0_8px_rgba(58,223,250,0.8)]"
                                : "bg-error shadow-[0_0_8px_rgba(255,110,132,0.8)]"
                        }`}
                    />
                    <span className="text-[10px] text-on-surface-variant font-mono uppercase tracking-wider">
                        {status === "online" ? "Online" : "Offline"}
                    </span>
                </div>

                {/* Notification icon */}
                <button className="text-primary hover:text-secondary hover:blur-[1px] transition-all duration-500">
                    <span className="material-symbols-outlined">notifications_paused</span>
                </button>

                {/* Blur icon */}
                <button className="text-primary hover:text-secondary hover:blur-[1px] transition-all duration-500">
                    <span className="material-symbols-outlined">blur_on</span>
                </button>

                {/* Avatar */}
                <div className="w-10 h-10 rounded-full overflow-hidden border border-primary/20 bg-surface-container-high flex items-center justify-center">
                    <span className="text-primary text-lg font-bold">A</span>
                </div>
            </div>
        </header>
    );
}

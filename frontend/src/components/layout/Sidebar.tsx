"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const navItems = [
    { href: "/", label: "Dashboard", icon: "◉" },
    { href: "/energy", label: "Energy Forecast", icon: "⚡" },
    { href: "/burnout", label: "Burnout Monitor", icon: "🛡" },
    { href: "/scheduler", label: "RL Scheduler", icon: "📋" },
    { href: "/identity", label: "Identity Alignment", icon: "🧬" },
    { href: "/analytics", label: "Analytics", icon: "📊" },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [status, setStatus] = useState<"online" | "offline">("offline");
    const [modelInfo, setModelInfo] = useState("Checking...");
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        async function checkBackend() {
            try {
                const res = await fetch(`${API_BASE}/api/health`, {
                    signal: AbortSignal.timeout(3000),
                });
                if (res.ok) {
                    setStatus("online");
                    try {
                        const userId = localStorage.getItem("aurora_user_id");
                        if (userId) {
                            const eRes = await fetch(`${API_BASE}/api/energy/forecast/${userId}`, {
                                signal: AbortSignal.timeout(3000),
                            });
                            if (eRes.ok) {
                                const eData = await eRes.json();
                                setModelInfo(eData.model_type === "lstm" ? "LSTM" : "Heuristic");
                            } else {
                                setModelInfo("Heuristic");
                            }
                        } else {
                            setModelInfo("No user");
                        }
                    } catch {
                        setModelInfo("Heuristic");
                    }
                }
            } catch {
                setStatus("offline");
                setModelInfo("Offline");
            }
        }

        checkBackend();
        const interval = setInterval(checkBackend, 30000);
        return () => clearInterval(interval);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    return (
        <>
            {/* Mobile hamburger button */}
            <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden fixed top-4 left-4 z-[60] w-10 h-10 rounded-xl bg-surface-300/80 backdrop-blur-xl border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                aria-label="Toggle menu"
            >
                <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
                    <path
                        d={mobileOpen
                            ? "M1 1L17 13M1 13L17 1"
                            : "M0 1H18M0 7H18M0 13H18"
                        }
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                </svg>
            </button>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="sidebar-overlay lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed left-0 top-0 h-screen w-64 bg-surface-400/80 backdrop-blur-xl border-r border-white/5 flex flex-col z-50 transition-transform duration-300",
                mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}>
                {/* Logo */}
                <div className="p-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-aurora-500 to-accent-cyan flex items-center justify-center animate-pulse-glow">
                            <span className="text-white font-bold text-lg">A</span>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold gradient-text">AURORA</h1>
                            <p className="text-[10px] text-gray-500 font-mono tracking-widest">
                                BEHAVIORAL AI
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em] px-4 mb-3">
                        Modules
                    </p>
                    {navItems.map((item, i) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "nav-link animate-slide-in-left",
                                pathname === item.href && "active"
                            )}
                            style={{ animationDelay: `${i * 0.05}s` }}
                        >
                            <span className="text-base">{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                {/* System Status */}
                <div className="p-4 border-t border-white/5">
                    <div className="glass-card p-3 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`status-dot ${status === "online" ? "status-low" : "status-critical"} animate-pulse-slow`} />
                            <span className="text-xs text-gray-400">
                                {status === "online" ? "System Online" : "System Offline"}
                            </span>
                        </div>
                        <p className="text-[10px] text-gray-600 font-mono">
                            v1.0.0 • Models: {modelInfo}
                        </p>
                    </div>
                </div>
            </aside>
        </>
    );
}

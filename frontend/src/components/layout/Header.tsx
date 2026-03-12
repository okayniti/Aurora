"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const navItems = [
    { href: "/", label: "Dashboard", shortLabel: "Dash", icon: "◉" },
    { href: "/energy", label: "Energy Forecast", shortLabel: "Energy", icon: "⚡" },
    { href: "/burnout", label: "Burnout Monitor", shortLabel: "Burnout", icon: "🛡" },
    { href: "/scheduler", label: "RL Scheduler", shortLabel: "Schedule", icon: "📋" },
    { href: "/identity", label: "Identity Alignment", shortLabel: "Identity", icon: "🧬" },
    { href: "/analytics", label: "Analytics", shortLabel: "Stats", icon: "📊" },
];

export default function Header() {
    const pathname = usePathname();
    const [status, setStatus] = useState<"online" | "offline">("offline");
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        async function checkBackend() {
            try {
                const res = await fetch(`${API_BASE}/api/health`, {
                    signal: AbortSignal.timeout(3000),
                });
                if (res.ok) {
                    setStatus("online");
                }
            } catch {
                setStatus("offline");
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
            <header className={cn(
                "fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b",
                scrolled
                    ? "bg-black/40 backdrop-blur-xl border-white/10 shadow-2xl py-3"
                    : "bg-transparent border-transparent py-5"
            )}>
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-aurora-500 to-accent-cyan flex flex-shrink-0 items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                            <span className="text-white font-bold text-lg">A</span>
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-lg font-bold text-white tracking-wide">AURORA</h1>
                            <p className="text-[9px] text-gray-400 font-mono tracking-widest uppercase">
                                Behavioral AI
                            </p>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-2 py-1.5 backdrop-blur-md">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2",
                                        isActive
                                            ? "bg-white/10 text-white shadow-sm"
                                            : "text-gray-400 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <span className={cn("transition-transform duration-300", isActive && "scale-110")}>{item.icon}</span>
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right Side: Status & Mobile Menu Button */}
                    <div className="flex items-center gap-4">
                        {/* Status Indicator */}
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                            <span className={`w-2 h-2 rounded-full ${status === "online" ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" : "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]"} animate-pulse-slow`} />
                            <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">
                                {status === "online" ? "Online" : "Offline"}
                            </span>
                        </div>

                        {/* Mobile hamburger button */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="lg:hidden w-10 h-10 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
                            aria-label="Toggle menu"
                        >
                            <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
                                <path
                                    d={mobileOpen
                                        ? "M2 2L18 14M2 14L18 2"
                                        : "M1 2H19M1 8H19M1 14H19"
                                    }
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Navigation Dropdown */}
            <div className={cn(
                "fixed inset-0 z-40 bg-black/95 backdrop-blur-3xl transition-opacity duration-300 lg:hidden flex flex-col pt-24 pb-8 px-6",
                mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            )}>
                <nav className="flex flex-col gap-2 flex-1 overflow-y-auto">
                    {navItems.map((item, i) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "px-6 py-4 rounded-2xl text-lg font-medium transition-all duration-300 flex items-center gap-4 border",
                                    isActive
                                        ? "bg-white/10 text-white border-white/20"
                                        : "text-gray-400 hover:text-white hover:bg-white/5 border-transparent",
                                    mobileOpen ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"
                                )}
                                style={{ transitionDelay: mobileOpen ? `${i * 50}ms` : '0ms' }}
                            >
                                <span className={cn("text-2xl", isActive && "text-aurora-400")}>{item.icon}</span>
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
                <div className="mt-auto pt-6 border-t border-white/10 flex items-center justify-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${status === "online" ? "bg-emerald-400" : "bg-red-400"} animate-pulse-slow`} />
                    <span className="text-sm text-gray-400 font-mono uppercase tracking-wider">
                        System {status === "online" ? "Online" : "Offline"}
                    </span>
                </div>
            </div>
        </>
    );
}

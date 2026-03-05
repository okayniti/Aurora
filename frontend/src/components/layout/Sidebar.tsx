"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

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

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-surface-400/80 backdrop-blur-xl border-r border-white/5 flex flex-col z-50">
            {/* Logo */}
            <div className="p-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-aurora-500 to-accent-cyan flex items-center justify-center">
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
            <nav className="flex-1 p-4 space-y-1">
                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em] px-4 mb-3">
                    Modules
                </p>
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "nav-link",
                            pathname === item.href && "active"
                        )}
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
                        <span className="status-dot status-low animate-pulse-slow" />
                        <span className="text-xs text-gray-400">System Online</span>
                    </div>
                    <p className="text-[10px] text-gray-600 font-mono">
                        v1.0.0 • Models: Heuristic
                    </p>
                </div>
            </div>
        </aside>
    );
}

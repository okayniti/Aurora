"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
    { href: "/", icon: "bubble_chart", label: "Neural Hub", filled: true },
    { href: "/energy", icon: "auto_awesome", label: "Energy Flow" },
    { href: "/scheduler", icon: "timeline", label: "Task Journey" },
    { href: "/burnout", icon: "psychology", label: "AI Insights" },
];

export default function SideNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed left-6 top-1/2 -translate-y-1/2 h-[716px] w-20 rounded-full bg-[#0a0e13]/60 backdrop-blur-2xl flex flex-col items-center justify-around py-12 z-50 shadow-glow border border-primary/10">
            {/* Top icon */}
            <div className="mb-4">
                <span
                    className="material-symbols-outlined text-primary text-2xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                >
                    bubble_chart
                </span>
            </div>

            {/* Nav links */}
            <div className="flex flex-col gap-10 items-center">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={item.label}
                            className={`
                                group relative transition-all duration-500
                                ${isActive
                                    ? "text-primary scale-125"
                                    : "text-on-surface-variant opacity-40 hover:opacity-100 hover:text-secondary"
                                }
                            `}
                        >
                            <span
                                className="material-symbols-outlined"
                                style={isActive && item.filled !== false ? { fontVariationSettings: "'FILL' 1" } : undefined}
                            >
                                {item.icon}
                            </span>
                            {/* Tooltip */}
                            <span className="absolute left-full ml-4 px-2 py-1 rounded bg-surface-container text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-on-surface">
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>

            {/* Settings at bottom */}
            <div className="mt-auto">
                <Link
                    href="/analytics"
                    className="text-on-surface-variant opacity-40 hover:opacity-100 hover:text-secondary transition-all duration-300"
                >
                    <span className="material-symbols-outlined">settings</span>
                </Link>
            </div>
        </nav>
    );
}

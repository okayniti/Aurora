"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
    { href: "/", icon: "bubble_chart", label: "Neural Hub", filled: true },
    { href: "/energy", icon: "auto_awesome", label: "Energy Flow" },
    { href: "/scheduler", icon: "timeline", label: "Task Journey" },
    { href: "/burnout", icon: "psychology", label: "AI Insights" },
    { href: "/identity", icon: "fingerprint", label: "Identity" },
    { href: "/analytics", icon: "settings", label: "Analytics" },
];

interface SideNavProps {
    mobileOpen?: boolean;
    onClose?: () => void;
}

export default function SideNav({ mobileOpen, onClose }: SideNavProps) {
    const pathname = usePathname();

    return (
        <>
            {/* ── Desktop: Vertical pill sidebar ── */}
            <nav className="hidden md:flex fixed left-6 top-1/2 -translate-y-1/2 h-[716px] w-20 rounded-full bg-[#0a0e13]/60 backdrop-blur-2xl flex-col items-center justify-around py-12 z-50 shadow-glow border border-primary/10">
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
                    {navItems.slice(0, 4).map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                prefetch={true}
                                title={item.label}
                                className={`
                                    group relative outline-none transition-all duration-300 transform
                                    ${isActive
                                        ? "text-primary scale-125"
                                        : "text-on-surface-variant opacity-40 hover:opacity-100 hover:text-primary hover:scale-110"
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
                        prefetch={true}
                        className="text-on-surface-variant opacity-40 hover:opacity-100 hover:text-primary hover:scale-110 outline-none transition-all duration-300 inline-block transform"
                    >
                        <span className="material-symbols-outlined">settings</span>
                    </Link>
                </div>
            </nav>

            {/* ── Mobile: Slide-in drawer ── */}
            {/* Backdrop overlay */}
            <div
                className={`md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300 ${
                    mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
                onClick={onClose}
            />

            {/* Drawer panel */}
            <nav
                className={`md:hidden fixed left-0 top-0 bottom-0 w-72 bg-[#0a0e13]/95 backdrop-blur-2xl z-[70] border-r border-primary/10 flex flex-col p-6 pt-24 transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
                    mobileOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 w-11 h-11 flex items-center justify-center rounded-xl text-on-surface-variant hover:text-on-surface transition-colors"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>

                {/* Logo */}
                <div className="text-2xl font-black tracking-tighter text-primary drop-shadow-[0_0_15px_rgba(204,151,255,0.4)] mb-10">
                    AURORA
                </div>

                {/* Nav links */}
                <div className="flex flex-col gap-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                prefetch={true}
                                onClick={onClose}
                                className={`flex items-center gap-4 px-4 py-3 min-h-[44px] rounded-xl transition-all duration-300 ${
                                    isActive
                                        ? "text-primary bg-primary/10 border border-primary/20"
                                        : "text-on-surface-variant hover:text-on-surface hover:bg-white/5"
                                }`}
                            >
                                <span
                                    className="material-symbols-outlined text-xl"
                                    style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                                >
                                    {item.icon}
                                </span>
                                <span className="text-sm font-medium tracking-wide">
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>

                {/* Bottom decoration */}
                <div className="mt-auto pt-6 border-t border-white/5">
                    <p className="text-[10px] text-on-surface-variant/40 uppercase tracking-widest">
                        Aurora v2.0 · Fluid Intelligence
                    </p>
                </div>
            </nav>
        </>
    );
}

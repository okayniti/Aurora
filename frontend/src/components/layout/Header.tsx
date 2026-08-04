"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatedGradientText } from "@/components/ui/AnimatedGradientText";
import { api } from "@/lib/api";
import { useUser } from "@/lib/UserContext";

interface TopBarProps {
    onMenuToggle?: () => void;
}

export default function TopBar({ onMenuToggle }: TopBarProps) {
    const [status, setStatus] = useState<"online" | "offline">("offline");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { userEmail, signOut } = useUser();
    const displayEmail = userEmail || "…";
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function checkBackend() {
            try {
                await api.healthCheck();
                setStatus("online");
            } catch {
                setStatus("offline");
            }
        }
        checkBackend();
        const interval = setInterval(checkBackend, 30000);

        function close(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        }
        function closeOnEscape(e: KeyboardEvent) {
            if (e.key === "Escape") setDropdownOpen(false);
        }
        document.addEventListener("mousedown", close);
        document.addEventListener("keydown", closeOnEscape);

        return () => {
            clearInterval(interval);
            document.removeEventListener("mousedown", close);
            document.removeEventListener("keydown", closeOnEscape);
        };
    }, []);

    const handleSignOut = () => {
        setDropdownOpen(false);
        signOut();
    };

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
                <div className="text-2xl md:text-3xl font-black tracking-tighter drop-shadow-[0_0_15px_rgba(204,151,255,0.4)]">
                    <AnimatedGradientText>AURORA</AnimatedGradientText>
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
                <button aria-label="Notifications" className="w-11 h-11 flex items-center justify-center rounded-xl text-primary hover:text-secondary hover:blur-[1px] transition-all duration-500">
                    <span aria-hidden="true" className="material-symbols-outlined">notifications_paused</span>
                </button>

                {/* Grid icon — hidden on mobile */}
                <button aria-label="Grid view" className="hidden md:flex w-11 h-11 items-center justify-center rounded-xl text-primary hover:text-secondary hover:blur-[1px] transition-all duration-500">
                    <span aria-hidden="true" className="material-symbols-outlined">blur_on</span>
                </button>

                {/* Avatar with Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        aria-label="Account menu"
                        aria-haspopup="menu"
                        aria-expanded={dropdownOpen}
                        className="w-10 h-10 md:w-10 md:h-10 rounded-full overflow-hidden border border-primary/20 bg-surface-container-high flex items-center justify-center shrink-0 hover:border-primary transition-colors duration-300"
                    >
                        <span aria-hidden="true" className="text-primary text-lg font-bold uppercase">{displayEmail.charAt(0)}</span>
                    </button>

                    {dropdownOpen && (
                        <div role="menu" aria-label="Account" className="absolute right-0 mt-3 w-56 rounded-xl glass-panel border border-primary/20 shadow-2xl py-2 flex flex-col z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="px-4 py-3 border-b border-primary/10 mb-1">
                                <p className="text-sm font-medium text-on-surface truncate">{displayEmail}</p>
                                <p className="text-xs text-on-surface-variant mt-0.5">Aurora User</p>
                            </div>
                            <button
                                role="menuitem"
                                onClick={handleSignOut}
                                className="mx-2 px-3 py-2 text-left text-sm text-error hover:bg-error/10 hover:text-error rounded-lg transition-colors flex items-center gap-2 mt-1"
                            >
                                <span aria-hidden="true" className="material-symbols-outlined text-[18px]">logout</span>
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

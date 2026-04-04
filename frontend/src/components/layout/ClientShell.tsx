"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TopBar from "@/components/layout/Header";
import SideNav from "@/components/layout/SideNav";
import AuroraBackground from "@/components/ui/AuroraBackground";
import { UserProvider } from "@/lib/UserContext";

export default function ClientShell({ children }: { children: React.ReactNode }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const routes = ['/energy', '/burnout', '/scheduler', '/identity', '/analytics'];
        routes.forEach(route => router.prefetch(route));
    }, [router]);

    return (
        <UserProvider>
            {/* Atmospheric aurora background */}
            <AuroraBackground />

            {/* Top bar — passes hamburger toggle */}
            <TopBar onMenuToggle={() => setMenuOpen((prev) => !prev)} />

            {/* Sidebar — receives mobile state */}
            <SideNav mobileOpen={menuOpen} onClose={() => setMenuOpen(false)} />

            {/* Main content — responsive padding */}
            <main className="relative z-10 pt-24 md:pt-32 px-4 md:pl-32 md:pr-8 lg:pr-16 min-h-screen pb-12">
                {children}
            </main>
        </UserProvider>
    );
}

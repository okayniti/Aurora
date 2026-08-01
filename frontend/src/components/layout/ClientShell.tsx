"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import TopBar from "@/components/layout/Header";
import SideNav from "@/components/layout/SideNav";
import AuroraBackground from "@/components/ui/AuroraBackground";
import { UserProvider } from "@/lib/UserContext";

/** Sign-in and sign-up render bare — no nav chrome, no user menu. */
const PUBLIC_ROUTES = ["/login", "/register"];

export default function ClientShell({ children }: { children: React.ReactNode }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    useEffect(() => {
        const routes = ['/energy', '/burnout', '/scheduler', '/identity', '/analytics'];
        routes.forEach(route => router.prefetch(route));
    }, [router]);

    return (
        <UserProvider>
            {/* Atmospheric aurora background */}
            <AuroraBackground />

            {isPublicRoute ? (
                <main className="relative z-10 min-h-screen">{children}</main>
            ) : (
                <>
                    {/* Top bar — passes hamburger toggle */}
                    <TopBar onMenuToggle={() => setMenuOpen((prev) => !prev)} />

                    {/* Sidebar — receives mobile state */}
                    <SideNav mobileOpen={menuOpen} onClose={() => setMenuOpen(false)} />

                    {/* Main content — responsive padding */}
                    <main className="relative z-10 pt-24 md:pt-32 px-4 md:pl-32 md:pr-8 lg:pr-16 min-h-screen pb-12">
                        {children}
                    </main>
                </>
            )}
        </UserProvider>
    );
}

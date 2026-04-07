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
        
        async function checkAuth() {
            const token = localStorage.getItem("aurora_token");
            if (!token) {
                router.push("/login");
                return;
            }
            try {
                const res = await fetch("http://localhost:8000/api/auth/me", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (!res.ok) {
                    localStorage.removeItem("aurora_token");
                    router.push("/login");
                } else {
                    const data = await res.json();
                    localStorage.setItem("aurora_user_email", data.email || "");
                }
            } catch (err) {
                router.push("/login");
            }
        }
        
        if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
            checkAuth();
        }
    }, [router]);

    const pathname = typeof window !== "undefined" ? window.location.pathname : "";
    const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');

    if (isAuthPage) {
        return (
            <UserProvider>
                <div className="relative z-10 min-h-screen">
                    <AuroraBackground />
                    {children}
                </div>
            </UserProvider>
        );
    }

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

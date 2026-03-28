import type { Metadata } from "next";
import "./globals.css";
import TopBar from "@/components/layout/Header";
import SideNav from "@/components/layout/SideNav";
import AuroraBackground from "@/components/ui/AuroraBackground";
import { UserProvider } from "@/lib/UserContext";

export const metadata: Metadata = {
    title: "AURORA — Dynamic Intelligence Hub",
    description:
        "AI-powered behavioral intelligence system that predicts cognitive energy, optimizes schedules, and prevents burnout using machine learning.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html className="dark" lang="en">
            <head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap"
                    rel="stylesheet"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className="min-h-screen selection:bg-primary/30 selection:text-primary">
                <UserProvider>
                    {/* Atmospheric aurora background */}
                    <AuroraBackground />

                    {/* Top bar */}
                    <TopBar />

                    {/* Vertical sidebar navigation */}
                    <SideNav />

                    {/* Main content */}
                    <main className="relative z-10 pt-32 pl-8 lg:pl-32 pr-8 lg:pr-16 min-h-screen">
                        {children}
                    </main>
                </UserProvider>
            </body>
        </html>
    );
}

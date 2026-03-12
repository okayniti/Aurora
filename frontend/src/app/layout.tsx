import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import { UserProvider } from "@/lib/UserContext";

export const metadata: Metadata = {
    title: "AURORA — Adaptive Behavioral Intelligence",
    description:
        "AI-powered human performance operating system that predicts cognitive energy, optimizes schedules, and prevents burnout using machine learning.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <UserProvider>
                    <div className="flex flex-col min-h-screen">
                        <Header />
                        <main className="flex-1 w-full pt-28 pb-12 px-6">
                            <div className="max-w-7xl mx-auto">{children}</div>
                        </main>
                    </div>
                </UserProvider>
            </body>
        </html>
    );
}

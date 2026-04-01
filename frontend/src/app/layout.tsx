import type { Metadata } from "next";
import "./globals.css";
import ClientShell from "@/components/layout/ClientShell";
import Providers from "./providers";

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
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </head>
            <body className="min-h-screen selection:bg-primary/30 selection:text-primary">
                <Providers>
                    <ClientShell>{children}</ClientShell>
                </Providers>
            </body>
        </html>
    );
}

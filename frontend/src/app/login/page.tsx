"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatedGradientText } from "@/components/ui/AnimatedGradientText";
import { ShimmerButton } from "@/components/ui/ShimmerButton";
import { api } from "@/lib/api";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async () => {
        if (!email || !password) {
            setError("Please fill in both fields");
            return;
        }
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch("http://localhost:8000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || "Login failed");
            }

            const data = await res.json();
            localStorage.setItem("aurora_token", data.access_token);
            
            // Fetch initial user data
            const meRes = await fetch("http://localhost:8000/api/auth/me", {
                headers: { "Authorization": `Bearer ${data.access_token}` }
            });
            if (meRes.ok) {
                const meData = await meRes.json();
                localStorage.setItem("aurora_user_email", meData.email);
            }

            router.push("/energy");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative z-10 w-full font-sans">
            <div className="w-full max-w-md glass-panel p-8 md:p-10 rounded-3xl flex flex-col items-center border border-primary/20 shadow-[0_0_40px_rgba(204,151,255,0.05)]">
                
                <div className="text-4xl md:text-5xl font-black tracking-tighter drop-shadow-[0_0_15px_rgba(204,151,255,0.4)] mb-2 mt-4">
                    <AnimatedGradientText>AURORA</AnimatedGradientText>
                </div>
                <p className="text-on-surface-variant text-sm mb-10 text-center font-light tracking-wide">
                    Adaptive Unified Reinforcement Optimized Routine Architect
                </p>

                <div className="w-full space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-primary/80 pl-1 block">Email</label>
                        <input 
                            type="email" 
                            className="w-full bg-black/20 border border-primary/10 rounded-xl px-4 py-3 text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all duration-300"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-primary/80 pl-1 block">Password</label>
                        <input 
                            type="password" 
                            className="w-full bg-black/20 border border-primary/10 rounded-xl px-4 py-3 text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all duration-300"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                {error && (
                    <div className="w-full mt-4 p-3 rounded-lg bg-error/10 border border-error/20 flex gap-2 items-center text-error text-sm">
                        <span className="material-symbols-outlined text-[18px]">error</span>
                        {error}
                    </div>
                )}

                <div className="w-full mt-8 flex flex-col gap-4">
                    <div className="w-full relative group">
                        <ShimmerButton 
                            className="w-full mx-auto" 
                            onClick={handleLogin}
                        >
                            {isLoading ? "Authenticating..." : "Enter System"}
                        </ShimmerButton>
                    </div>

                    <p className="text-center text-sm text-on-surface-variant mt-2">
                        Don't have an account? <Link href="/register" className="text-secondary hover:text-primary transition-colors duration-300 font-medium">Register</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

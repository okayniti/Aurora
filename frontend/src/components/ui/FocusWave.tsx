"use client";

import React from "react";

export default function FocusWave() {
    return (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden -z-10 opacity-30">
            <svg className="w-full h-full" viewBox="0 0 800 400">
                <path
                    className="energy-wave"
                    d="M0 200 Q 200 100 400 200 T 800 200"
                    fill="none"
                    stroke="url(#gradient-energy)"
                    strokeWidth="4"
                >
                    <animate
                        attributeName="d"
                        dur="10s"
                        repeatCount="indefinite"
                        values="M0 200 Q 200 100 400 200 T 800 200; M0 200 Q 200 300 400 200 T 800 200; M0 200 Q 200 100 400 200 T 800 200"
                    />
                </path>
                <defs>
                    <linearGradient id="gradient-energy" x1="0%" x2="100%" y1="0%" y2="0%">
                        <stop offset="0%" style={{ stopColor: "#cc97ff", stopOpacity: 0 }} />
                        <stop offset="50%" style={{ stopColor: "#3adffa", stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: "#9093ff", stopOpacity: 0 }} />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
}

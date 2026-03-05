import type { Config } from "tailwindcss";

const config: Config = {
    content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
    theme: {
        extend: {
            colors: {
                aurora: {
                    50: "#f0f4ff",
                    100: "#dbe4ff",
                    200: "#bac8ff",
                    300: "#91a7ff",
                    400: "#748ffc",
                    500: "#5c7cfa",
                    600: "#4c6ef5",
                    700: "#4263eb",
                    800: "#3b5bdb",
                    900: "#364fc7",
                    950: "#1a2452",
                },
                surface: {
                    DEFAULT: "#0a0e1a",
                    50: "#f8f9fc",
                    100: "#e8ecf4",
                    200: "#d1d9e8",
                    300: "#0f1629",
                    400: "#0d1220",
                    500: "#0a0e1a",
                    600: "#080b14",
                    700: "#06080f",
                    800: "#04050a",
                    900: "#020305",
                },
                accent: {
                    cyan: "#22d3ee",
                    green: "#34d399",
                    amber: "#fbbf24",
                    rose: "#fb7185",
                    violet: "#a78bfa",
                },
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
                mono: ["JetBrains Mono", "monospace"],
            },
            boxShadow: {
                glow: "0 0 20px rgba(92, 124, 250, 0.15)",
                "glow-cyan": "0 0 20px rgba(34, 211, 238, 0.15)",
                "glow-green": "0 0 20px rgba(52, 211, 153, 0.15)",
            },
            animation: {
                "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                "fade-in": "fadeIn 0.5s ease-out",
                "slide-up": "slideUp 0.5s ease-out",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": { opacity: "0", transform: "translateY(10px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
            },
        },
    },
    plugins: [],
};

export default config;

import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
    theme: {
        extend: {
            colors: {
                // ── Primary ──────────────────────────────
                primary: "#cc97ff",
                "primary-dim": "#9c48ea",
                "primary-container": "#c284ff",
                "primary-fixed": "#c284ff",
                "primary-fixed-dim": "#b971ff",
                "on-primary": "#47007c",
                "on-primary-container": "#360061",
                "on-primary-fixed": "#000000",
                "on-primary-fixed-variant": "#430076",
                "inverse-primary": "#842cd3",

                // ── Secondary ────────────────────────────
                secondary: "#3adffa",
                "secondary-dim": "#1ad0eb",
                "secondary-fixed": "#48e4ff",
                "secondary-fixed-dim": "#29d6f1",
                "secondary-container": "#006877",
                "on-secondary": "#004b56",
                "on-secondary-container": "#eafbff",
                "on-secondary-fixed": "#003a43",
                "on-secondary-fixed-variant": "#005966",

                // ── Tertiary ─────────────────────────────
                tertiary: "#9093ff",
                "tertiary-dim": "#6063ee",
                "tertiary-fixed": "#a6a9ff",
                "tertiary-fixed-dim": "#9699ff",
                "tertiary-container": "#7073ff",
                "on-tertiary": "#080079",
                "on-tertiary-container": "#000000",
                "on-tertiary-fixed": "#050061",
                "on-tertiary-fixed-variant": "#1e18b2",

                // ── Error ────────────────────────────────
                error: "#ff6e84",
                "error-dim": "#d73357",
                "error-container": "#a70138",
                "on-error": "#490013",
                "on-error-container": "#ffb2b9",

                // ── Surfaces ─────────────────────────────
                background: "#0a0e13",
                "on-background": "#f4f6fe",
                surface: "#0a0e13",
                "surface-dim": "#0a0e13",
                "surface-bright": "#262d35",
                "surface-tint": "#cc97ff",
                "surface-variant": "#21262e",
                "surface-container-lowest": "#000000",
                "surface-container-low": "#0f1419",
                "surface-container": "#151a20",
                "surface-container-high": "#1b2027",
                "surface-container-highest": "#21262e",
                "on-surface": "#f4f6fe",
                "on-surface-variant": "#a8abb2",

                // ── Outline & Inverse ────────────────────
                outline: "#72767c",
                "outline-variant": "#44484e",
                "inverse-surface": "#f8f9ff",
                "inverse-on-surface": "#51555b",
            },
            fontFamily: {
                headline: ["Inter", "system-ui", "sans-serif"],
                body: ["Inter", "system-ui", "sans-serif"],
                label: ["Inter", "system-ui", "sans-serif"],
                sans: ["Inter", "system-ui", "sans-serif"],
                mono: ["JetBrains Mono", "monospace"],
            },
            borderRadius: {
                DEFAULT: "1rem",
                lg: "2rem",
                xl: "3rem",
                full: "9999px",
            },
            boxShadow: {
                glow: "0px 20px 40px rgba(204, 151, 255, 0.08)",
                "glow-primary": "0 0 15px rgba(204, 151, 255, 0.6)",
                "glow-secondary": "0 0 50px rgba(58, 223, 250, 0.1)",
            },
            transitionTimingFunction: {
                fluid: "cubic-bezier(0.2, 0.8, 0.2, 1)",
            },
            animation: {
                "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                "fade-in": "fadeIn 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)",
                "slide-up": "slideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)",
                "float": "float 6s ease-in-out infinite",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": { opacity: "0", transform: "translateY(16px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                float: {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-8px)" },
                },
            },
        },
    },
    plugins: [],
};

export default config;

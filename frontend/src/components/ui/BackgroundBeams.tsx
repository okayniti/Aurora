"use client";

export function BackgroundBeams({ className = "" }: { className?: string }) {
    return (
        <div className={`absolute inset-0 overflow-hidden pointer-events-none -z-10 ${className}`}>
            <svg
                className="absolute inset-0 w-full h-full opacity-20"
                viewBox="0 0 800 600"
                fill="none"
                preserveAspectRatio="none"
            >
                <defs>
                    <linearGradient id="beam-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#cc97ff" stopOpacity="0" />
                        <stop offset="50%" stopColor="#cc97ff" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#cc97ff" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="beam-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3adffa" stopOpacity="0" />
                        <stop offset="50%" stopColor="#3adffa" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#3adffa" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="beam-grad-3" x1="100%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#9093ff" stopOpacity="0" />
                        <stop offset="50%" stopColor="#9093ff" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#9093ff" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Diagonal beams */}
                <line x1="-50" y1="0" x2="400" y2="600" stroke="url(#beam-grad-1)" strokeWidth="1">
                    <animate attributeName="x1" values="-50;200;-50" dur="8s" repeatCount="indefinite" />
                    <animate attributeName="x2" values="400;650;400" dur="8s" repeatCount="indefinite" />
                </line>
                <line x1="200" y1="0" x2="650" y2="600" stroke="url(#beam-grad-2)" strokeWidth="0.8">
                    <animate attributeName="x1" values="200;450;200" dur="11s" repeatCount="indefinite" />
                    <animate attributeName="x2" values="650;900;650" dur="11s" repeatCount="indefinite" />
                </line>
                <line x1="500" y1="0" x2="250" y2="600" stroke="url(#beam-grad-3)" strokeWidth="0.6">
                    <animate attributeName="x1" values="500;300;500" dur="14s" repeatCount="indefinite" />
                    <animate attributeName="x2" values="250;50;250" dur="14s" repeatCount="indefinite" />
                </line>
                <line x1="700" y1="0" x2="350" y2="600" stroke="url(#beam-grad-1)" strokeWidth="0.5">
                    <animate attributeName="x1" values="700;850;700" dur="9s" repeatCount="indefinite" />
                </line>
                <line x1="100" y1="600" x2="550" y2="0" stroke="url(#beam-grad-2)" strokeWidth="0.4">
                    <animate attributeName="x1" values="100;300;100" dur="12s" repeatCount="indefinite" />
                </line>
            </svg>
        </div>
    );
}

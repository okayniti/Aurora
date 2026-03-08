"use client";

interface EmptyStateProps {
    icon: string;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in-up">
            <div className="text-5xl mb-4 animate-float">{icon}</div>
            <h3 className="text-lg font-semibold text-gray-300 mb-2">{title}</h3>
            <p className="text-sm text-gray-500 max-w-sm mb-6">{description}</p>
            {action && (
                <button
                    onClick={action.onClick}
                    className="px-5 py-2.5 rounded-xl bg-aurora-600 hover:bg-aurora-500 text-white text-sm font-medium transition-all duration-200 hover:shadow-glow"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
}

export function NoDataCard({
    title,
    message = "No data available yet. Start logging to see insights.",
}: {
    title: string;
    message?: string;
}) {
    return (
        <div className="glass-card p-6 animate-fade-in-up">
            <h2 className="section-title mb-4">{title}</h2>
            <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-surface-400/80 flex items-center justify-center mb-4">
                    <span className="text-2xl opacity-40">📊</span>
                </div>
                <p className="text-sm text-gray-500 max-w-xs">{message}</p>
            </div>
        </div>
    );
}

"use client";

import { useState, useEffect, useRef } from "react";

interface TypingPlaceholderProps {
    phrases: string[];
    typingSpeed?: number;
    deletingSpeed?: number;
    pauseTime?: number;
    className?: string;
    onSubmit?: (value: string) => void;
}

export function TypingPlaceholder({
    phrases,
    typingSpeed = 60,
    deletingSpeed = 30,
    pauseTime = 2000,
    className = "",
    onSubmit,
}: TypingPlaceholderProps) {
    const [placeholder, setPlaceholder] = useState("");
    const [inputValue, setInputValue] = useState("");
    const phraseIndex = useRef(0);
    const charIndex = useRef(0);
    const isDeleting = useRef(false);

    useEffect(() => {
        const tick = () => {
            const current = phrases[phraseIndex.current];

            if (!isDeleting.current) {
                charIndex.current++;
                setPlaceholder(current.slice(0, charIndex.current));

                if (charIndex.current === current.length) {
                    isDeleting.current = true;
                    return pauseTime;
                }
                return typingSpeed + Math.random() * 40;
            } else {
                charIndex.current--;
                setPlaceholder(current.slice(0, charIndex.current));

                if (charIndex.current === 0) {
                    isDeleting.current = false;
                    phraseIndex.current = (phraseIndex.current + 1) % phrases.length;
                    return 400;
                }
                return deletingSpeed;
            }
        };

        let timeout: NodeJS.Timeout;
        const loop = () => {
            const delay = tick();
            timeout = setTimeout(loop, delay);
        };
        timeout = setTimeout(loop, 500);

        return () => clearTimeout(timeout);
    }, [phrases, typingSpeed, deletingSpeed, pauseTime]);

    return (
        <div className="relative">
            <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && inputValue.trim() && onSubmit) {
                        onSubmit(inputValue);
                        setInputValue("");
                    }
                }}
                className={`w-full bg-surface-container-lowest/40 border-0 border-b-2 border-white/10 focus:border-primary focus:shadow-[0_2px_12px_rgba(204,151,255,0.25)] text-sm py-4 px-0 transition-all duration-300 text-on-surface outline-none ${className}`}
                placeholder={placeholder + "│"}
                type="text"
            />
            <button
                onClick={() => {
                    if (inputValue.trim() && onSubmit) {
                        onSubmit(inputValue);
                        setInputValue("");
                    }
                }}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-primary/60 hover:text-primary transition-colors"
            >
                <span className="material-symbols-outlined">send</span>
            </button>
        </div>
    );
}

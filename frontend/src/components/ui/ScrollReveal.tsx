"use client";

import { motion } from "framer-motion";

interface ScrollRevealProps {
    children: React.ReactNode;
    index?: number;
    className?: string;
}

export const ScrollReveal = ({ children, index = 0, className = "" }: ScrollRevealProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20px" }}
            transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

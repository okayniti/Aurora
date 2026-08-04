"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "framer-motion";
import { useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {/* reducedMotion="user" makes every motion.* component in the app
          respect the OS-level prefers-reduced-motion setting automatically,
          without touching each individual usage site. */}
      <MotionConfig reducedMotion="user">
        {children}
      </MotionConfig>
    </QueryClientProvider>
  );
}

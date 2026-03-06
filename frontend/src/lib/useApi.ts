"use client";

import { useState, useEffect, useCallback } from "react";

interface UseApiResult<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

/**
 * Generic hook for API calls with loading/error states.
 * Automatically falls back to provided fallback data if API fails.
 */
export function useApi<T>(
    fetcher: () => Promise<T>,
    fallback: T,
    deps: any[] = []
): UseApiResult<T> {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetcher();
            setData(result);
        } catch (err: any) {
            console.warn("[AURORA] API call failed, using fallback:", err.message);
            setError(err.message);
            setData(fallback);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    useEffect(() => {
        fetch();
    }, [fetch]);

    return { data, loading, error, refetch: fetch };
}

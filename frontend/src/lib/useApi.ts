"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";

interface UseApiResult<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useApi<T>(
    fetcher: () => Promise<T>,
    fallback: T,
    deps: any[] = [],
    options: any = {}
): UseApiResult<T> {
    const { data, isLoading, error, refetch } = useQuery<T, Error>({
        queryKey: [...deps, fetcher.toString()],
        queryFn: async () => {
            try {
                return await fetcher();
            } catch (err: any) {
                console.warn("[AURORA] API call failed", err.message);
                throw err;
            }
        },
        retry: false,
        placeholderData: keepPreviousData,
        ...options
    });

    return { 
        data: error ? fallback : (isLoading ? null : (data !== undefined ? data : fallback)), 
        loading: isLoading, 
        error: error ? error.message : null, 
        refetch 
    };
}

"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import { api, getToken, clearSession, ApiError, type AuthUser } from "@/lib/api";

/** Pages that render without a session. */
const PUBLIC_ROUTES = ["/login", "/register"];

interface UserState {
  user: AuthUser | null;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  loading: boolean;
  error: string | null;
  setUser: (user: AuthUser) => void;
  refresh: () => Promise<void>;
  signOut: () => void;
}

const UserContext = createContext<UserState>({
  user: null,
  userId: null,
  userName: null,
  userEmail: null,
  loading: true,
  error: null,
  setUser: () => { },
  refresh: async () => { },
  signOut: () => { },
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  /** The signed-in user is whoever the token says it is — never "the first row in the users table". */
  const refresh = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setLoading(false);
      if (!isPublicRoute) router.replace("/login");
      return;
    }

    try {
      setUser(await api.getMe());
      setError(null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        // api.ts already cleared the session and redirected.
        setUser(null);
      } else {
        setError("backend_offline");
      }
    } finally {
      setLoading(false);
    }
  }, [isPublicRoute, router]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const signOut = useCallback(() => {
    clearSession();
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <UserContext.Provider
      value={{
        user,
        userId: user?.id ?? null,
        userName: user?.name ?? null,
        userEmail: user?.email ?? null,
        loading,
        error,
        setUser,
        refresh,
        signOut,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);

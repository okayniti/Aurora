"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface UserState {
  userId: string | null;
  userName: string | null;
  loading: boolean;
  error: string | null;
  setUserId: (id: string) => void;
}

const UserContext = createContext<UserState>({
  userId: null,
  userName: null,
  loading: true,
  error: null,
  setUserId: () => { },
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Try to discover a user from the backend
    async function discover() {
      try {
        // Check localStorage first
        const stored = localStorage.getItem("aurora_user_id");
        if (stored) {
          setUserId(stored);
          setUserName(localStorage.getItem("aurora_user_name") || "User");
          setLoading(false);
          return;
        }

        // Try to fetch users list from backend
        const res = await fetch(`${API_BASE}/api/users`, {
          signal: AbortSignal.timeout(3000),
        });
        if (res.ok) {
          const users = await res.json();
          if (users.length > 0) {
            const user = users[0]; // Use first user (demo user)
            setUserId(user.id);
            setUserName(user.name);
            localStorage.setItem("aurora_user_id", user.id);
            localStorage.setItem("aurora_user_name", user.name);
            setLoading(false);
            return;
          }
        }
        // Backend is up but no users
        setError("no_user");
      } catch {
        // Backend is offline
        setError("backend_offline");
      }
      setLoading(false);
    }

    discover();
  }, []);

  const handleSetUserId = (id: string) => {
    setUserId(id);
    localStorage.setItem("aurora_user_id", id);
    setError(null);
  };

  return (
    <UserContext.Provider
      value={{ userId, userName, loading, error, setUserId: handleSetUserId }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);

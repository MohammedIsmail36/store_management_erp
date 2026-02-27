"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { User } from "@/types/auth";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isAccountant: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (!token) {
      setUser(null);
      return;
    }

    const response = await api.getCurrentUser();
    if (response.success && response.data) {
      setUser(response.data as User);
      localStorage.setItem("user", JSON.stringify(response.data));
      return;
    }

    api.clearSession();
    setUser(null);
  }, []);

  useEffect(() => {
    const run = async () => {
      try {
        await refreshUser();
      } finally {
        setIsLoading(false);
      }
    };
    run();
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await api.login(email, password);
    if (!response.success) {
      return { success: false, message: response.message };
    }

    await refreshUser();
    return { success: true };
  }, [refreshUser]);

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      isAdmin: user?.role === "admin" || !!user?.is_admin,
      isAccountant: user?.role === "accountant" || user?.role === "admin" || !!user?.is_admin,
      login,
      logout,
      refreshUser,
    }),
    [user, isLoading, login, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

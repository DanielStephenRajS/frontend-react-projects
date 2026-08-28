import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { AdminContext } from "./admin-context";

const ADMIN_TOKEN_KEY = "johnny-fishing-admin-token";
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000").replace(/\/$/, "");

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem(ADMIN_TOKEN_KEY);
    setIsAdmin(Boolean(token));
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const trimmedUsername = username.trim();

    if (!trimmedUsername || !password) {
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: trimmedUsername,
          password,
        }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      const token = data?.access_token;

      if (!token) {
        return false;
      }

      sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
      setIsAdmin(true);
      return true;
    } catch (error) {
      console.error("Admin login failed:", error);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    setIsAdmin(false);
  }, []);

  const value = useMemo(
    () => ({
      isAdmin,
      login,
      logout,
    }),
    [isAdmin, login, logout],
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

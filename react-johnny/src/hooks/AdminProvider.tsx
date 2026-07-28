import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { AdminContext } from "./admin-context";

const ADMIN_SESSION_KEY = "johnny-fishing-admin-session";
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    setIsAdmin(raw === "active");
  }, []);

  const login = useCallback((username: string, password: string) => {
    const allowed = username.trim().toLowerCase() === ADMIN_USERNAME && password === ADMIN_PASSWORD;
    if (!allowed) {
      return false;
    }

    localStorage.setItem(ADMIN_SESSION_KEY, "active");
    setIsAdmin(true);
    return true;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
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

import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAdmin } from "../hooks/useAdmin";

export const RequireAdmin = ({ children }: { children: ReactNode }) => {
  const { isAdmin } = useAdmin();

  if (!isAdmin) {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
};

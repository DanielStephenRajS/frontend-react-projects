import { useContext } from "react";
import { AdminContext, type AdminContextValue } from "./admin-context";

export const useAdmin = (): AdminContextValue => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within AdminProvider");
  }
  return context;
};

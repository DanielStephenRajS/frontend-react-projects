import { createContext } from "react";

export interface AdminContextValue {
  isAdmin: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

export const AdminContext = createContext<AdminContextValue | undefined>(undefined);

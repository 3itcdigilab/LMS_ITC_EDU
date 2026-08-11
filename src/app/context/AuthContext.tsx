import { createContext, useContext, useState, type ReactNode } from "react";
import type { Role } from "../data/mock";

interface AuthContextType {
  role: Role | null;
  isGuest: boolean;
  originalRole: Role | null; // role sebelum switch — dipakai untuk "kembali ke mode mentor"
  login: (r: Role) => void;
  loginAsGuest: () => void;
  logout: () => void;
  switchRole: (r: Role) => void;
  returnToOriginal: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role | null>(() => {
    if (typeof window === "undefined") return null;
    return (localStorage.getItem("3itc_auth_role") as Role) || null;
  });

  const [isGuest, setIsGuestState] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("3itc_auth_is_guest") === "true";
  });

  const [originalRole, setOriginalRoleState] = useState<Role | null>(() => {
    if (typeof window === "undefined") return null;
    return (localStorage.getItem("3itc_auth_original_role") as Role) || null;
  });

  const setRole = (r: Role | null) => {
    setRoleState(r);
    if (r) localStorage.setItem("3itc_auth_role", r);
    else localStorage.removeItem("3itc_auth_role");
  };

  const setIsGuest = (g: boolean) => {
    setIsGuestState(g);
    if (g) localStorage.setItem("3itc_auth_is_guest", "true");
    else localStorage.removeItem("3itc_auth_is_guest");
  };

  const setOriginalRole = (r: Role | null) => {
    setOriginalRoleState(r);
    if (r) localStorage.setItem("3itc_auth_original_role", r);
    else localStorage.removeItem("3itc_auth_original_role");
  };

  const login = (r: Role) => {
    setRole(r);
    setIsGuest(false);
    setOriginalRole(null);
  };

  const loginAsGuest = () => {
    setRole("student");
    setIsGuest(true);
    setOriginalRole(null);
  };

  const logout = () => {
    setRole(null);
    setIsGuest(false);
    setOriginalRole(null);
    try {
      localStorage.removeItem("3itc_active_profile");
      localStorage.removeItem("3itc_active_email");
    } catch (_) {}
  };

  const switchRole = (r: Role) => {
    if (!originalRole) {
      setOriginalRole(role);
    }
    setRole(r);
  };

  const returnToOriginal = () => {
    if (originalRole) {
      setRole(originalRole);
      setOriginalRole(null);
    }
  };

  return (
    <AuthContext.Provider value={{ role, isGuest, originalRole, login, loginAsGuest, logout, switchRole, returnToOriginal }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { authAPI } from "./api";

interface AuthContextType {
  user: any | null;
  accountType: string;
  isOrgAdmin: boolean;
  isSiteAdmin: boolean;
  isLoggedIn: boolean;
  mounted: boolean;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  accountType: "",
  isOrgAdmin: false,
  isSiteAdmin: false,
  isLoggedIn: false,
  mounted: false,
  logout: () => {},
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [accountType, setAccountType] = useState("");
  const [isOrgAdmin, setIsOrgAdmin] = useState(false);
  const [isSiteAdmin, setIsSiteAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  const verifyAuth = useCallback(async () => {
    const storedType = localStorage.getItem("accountType");

    if (!storedType) {
      setUser(null);
      setAccountType("");
      setIsLoggedIn(false);
      return;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    try {
      if (storedType === "organization") {
        const res = await fetch(`${API_URL}/api/org-auth/me`, {
          credentials: "include", // sends cookie automatically
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        if (data.success) {
          setUser(data.data.organization);
          setAccountType("organization");
          setIsLoggedIn(true);
        } else {
          clearAuthState();
        }
      } else {
        const response = await authAPI.getCurrentUser();
        setUser(response.data.user);
        setAccountType("player");
        setIsSiteAdmin(response.data.user.isAdmin === true);
        setIsLoggedIn(true);

        try {
          const adminRes = await fetch(`${API_URL}/api/org-auth/admin-org`, {
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          });
          const adminData = await adminRes.json();
          if (adminData.success) {
            setIsOrgAdmin(true);
            localStorage.setItem("isOrgAdmin",   adminData.data.organization._id);
            localStorage.setItem("adminOrgId",   adminData.data.organization._id);
            localStorage.setItem("adminOrgName", adminData.data.organization.organizationName);
          } else {
            setIsOrgAdmin(false);
            localStorage.removeItem("isOrgAdmin");
            localStorage.removeItem("adminOrgId");
            localStorage.removeItem("adminOrgName");
          }
        } catch {
          setIsOrgAdmin(false);
        }
      }
    } catch {
      clearAuthState();
    }
  }, []);

  const clearAuthState = () => {
    setUser(null);
    setAccountType("");
    setIsOrgAdmin(false);
    setIsSiteAdmin(false);
    setIsLoggedIn(false);
  };

  useEffect(() => {
    // Optimistic restore from localStorage so the UI doesn't flash "Sign In"
    const storedType = localStorage.getItem("accountType") || "";
    if (storedType) {
      setAccountType(storedType);
      setIsLoggedIn(true);
      setIsOrgAdmin(!!localStorage.getItem("isOrgAdmin"));

      if (storedType === "organization") {
        try {
          const orgData = JSON.parse(localStorage.getItem("organizationData") || "{}");
          if (orgData?.tag || orgData?.organizationName) setUser(orgData);
        } catch {}
      }
    }

    setMounted(true);
    verifyAuth();
  }, [verifyAuth]);

  const logout = useCallback(async () => {
    await authAPI.logout();
    clearAuthState();
  }, []);

  return (
    <AuthContext.Provider value={{ user, accountType, isOrgAdmin, isSiteAdmin, isLoggedIn, mounted, logout, refresh: verifyAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

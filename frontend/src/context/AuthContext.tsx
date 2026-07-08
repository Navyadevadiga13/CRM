import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { login as loginRequest } from "../api/authApi";

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  region?: string | null;
  city?: string | null;
  cities?: string[];
  isActive?: boolean;
  lastLogin?: string | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("crm_token");
    const storedUser = localStorage.getItem("crm_user");

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("crm_token");
        localStorage.removeItem("crm_user");
      }
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await loginRequest({ email, password });
    localStorage.setItem("crm_token", data.token);
    localStorage.setItem("crm_user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("crm_token");
    localStorage.removeItem("crm_user");
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      logout,
    }),
    [isLoading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

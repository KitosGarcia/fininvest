import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api, { authService } from "../services/api";
import axios from "axios";

interface Permission {
  module: string;
  can_view: boolean;
  can_create: boolean;
  can_update: boolean;
  can_delete: boolean;
}

interface User {
  user_id: number;
  username: string;
  role_id: number;
  role_name?: string;
  permissions?: Permission[];
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (module: string, action: "view" | "create" | "update" | "delete") => boolean;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("user_data");

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
        axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`; // 🔧 restaura headers
      } catch (error) {
        console.warn("Erro ao recuperar utilizador do localStorage:", error);
        localStorage.removeItem("user_data");
      }
    }
  }, []);

const login = async (username: string, password: string) => {
  try {
    const res = await axios.post("/api/auth/login", { username, password });
    const { token, user, permissions } = res.data;

    user.permissions = permissions; 

    localStorage.setItem("auth_token", token);
    localStorage.setItem("user_data", JSON.stringify(user));
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    setUser(user);
    setToken(token);
    return true;
  } catch (err) {
    console.error("Erro ao fazer login:", err);
    return false;
  }
};

const hasPermission = (
  module: string,
  action: "view" | "create" | "update" | "delete"
): boolean => {
  if (!user?.permissions) return false;
  const perm = user.permissions.find(p => p.module === module);
  if (!perm) return false;

  return perm[`can_${action}`] ?? false;
};
  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout , hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

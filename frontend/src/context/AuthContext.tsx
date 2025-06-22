import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api, { authService } from "../services/api";
import axios from "axios";

interface User {
  user_id: number;
  username: string;
  role_id: number;
  role_name?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
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
    const { token, user } = await authService.login(username, password);

    localStorage.setItem("auth_token", token);
    localStorage.setItem("user_data", JSON.stringify(user));
    api.defaults.headers.common.Authorization = `Bearer ${token}`;

    setUser(user);
    setToken(token);
    return true;
  } catch (err) {
    console.error("Erro ao fazer login:", err);
    return false;
  }
};
  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
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

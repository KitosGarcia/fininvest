import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authService } from "../services/api";

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
  login: (username: string, password: string) => Promise<void>;
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
      } catch (error) {
        console.warn("Erro ao recuperar utilizador do localStorage:", error);
        localStorage.removeItem("user_data");
      }
    }
  }, []);

  const login = async (username: string, password: string) => {
    const res = await authService.login(username, password);
    localStorage.setItem("auth_token", res.token);
    localStorage.setItem("user_data", JSON.stringify(res.user));
    setUser(res.user);
    setToken(res.token);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
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

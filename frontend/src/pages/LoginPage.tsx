// src/pages/LoginPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, User } from "lucide-react";
import { authService } from "@/services/api";
import "./LoginPage.css";
import { useAuth } from "../context/AuthContext"; //

export default function LoginPage() {
  const { login } = useAuth(); //
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setShowError(false);

    try {
      const success = await login(username, password); // 👈 Usa o contexto
      if (success) {
        navigate("/dashboard");
      } else {
        throw new Error("Login falhou");
      }
    } catch (err: any) {
      setError("Credenciais inválidas");
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h2 className="title">FININVEST</h2>

        {showError && (
          <div className="error-toast">
            <span>{error}</span>
            <button onClick={() => setShowError(false)}>✖</button>
          </div>
        )}

        {/* Username */}
        <div className="input-wrapper">
          <div className="input-icon">
            <User size={18} />
          </div>
          <input
            type="text"
            placeholder="Utilizador"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
          />
        </div>

        {/* Password */}
        <div className="input-wrapper">
          <div className="input-icon">
            <Lock size={18} />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <button
            type="button"
            className="eye-btn"
            onClick={() => setShowPassword((p) => !p)}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {/* Submit */}
        <button type="submit" disabled={loading}>
          {loading && <Loader2 size={16} className="spin" />}
          {loading ? "A autenticar..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}

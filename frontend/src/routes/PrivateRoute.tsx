// src/routes/PrivateRoute.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Protege uma rota do React-Router.  
 * Se existir `auth_token` (e, opcionalmente, user no contexto), o
 * componente renderiza; caso contrário redirecciona para /login.
 */
export default function PrivateRoute({
  children,
}: {
  children?: JSX.Element;
}) {
  const { token } = useAuth();              // token já vem do contexto
  const location = useLocation();

  // ⚠️  A chave que guardamos no localStorage é "auth_token" (não "token")
  const localToken = token ?? localStorage.getItem("auth_token");

  if (!localToken) {
    // Guarda a rota que o utilizador tentou aceder para redirecionar depois
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Se vier “children” usa-os; caso contrário permite que o <Outlet/> renderize
  return children ?? <Outlet />;
}

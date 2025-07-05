import { useAuth } from "../../context/AuthContext";
import AlertsBell from "../alerts/AlertsBell";



export function Topbar() {
  const { user } = useAuth();


  return (
    <div className="w-full flex justify-between items-center px-4 py-2 bg-jarvis.bg shadow">
      {/* Título */}
      <h1 className="text-xl text-white font-semibold">Fininvest</h1>

      {/* Lado direito */}
      <div className="flex items-center space-x-4">
        {/* Sino de alertas visível só para administradores */}
        {user?.role_name === "admin" && <AlertsBell />}

        {/* Nome do utilizador */}
        <span className="text-white">{user?.username}</span>
      </div>
    </div>
  );
}

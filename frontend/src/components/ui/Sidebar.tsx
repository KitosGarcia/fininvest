import { useState } from "react";
import {
  Home,
  Users,
  FileText,
  LogOut,
  Settings,
  ChevronDown,
  ChevronRight,
  Landmark,
  Shield,
  File,
  Bell,
  List,
  UserCog,
  UserPlus,
  DollarSign
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { authService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export function Sidebar() {
  const { user } = useAuth();
  const [configOpen, setConfigOpen] = useState(false);

  const handleLogout = () => {
    authService.logout();
    window.location.href = "/login";
  };

  console.log("Sidebar user:", user); // ✅ Debug: ver o user no console

  return (
    <aside className="w-64 bg-blue-950 text-blue-100 h-full flex flex-col shadow-lg">
      <div className="p-4 text-xl font-bold tracking-wide border-b border-blue-800">
        FININVEST
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <NavLink className="flex items-center gap-2 hover:text-white" to="/">
          <Home size={18} /> Dashboard
        </NavLink>

        <NavLink className="flex items-center gap-2 hover:text-white" to="/clients">
          <Users size={18} /> Clientes
        </NavLink>

        <NavLink className="flex items-center gap-2 hover:text-white" to="/loans">
          <FileText size={18} /> Empréstimos
        </NavLink>

        {/* Configurações (submenu) */}
        <button
          className="flex items-center justify-between w-full text-left hover:text-white"
          onClick={() => setConfigOpen(!configOpen)}
        >
          <span className="flex items-center gap-2">
            <Settings size={18} /> Configurações
          </span>
          {configOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        {configOpen && (
          <div className="ml-6 mt-1 space-y-1 text-sm">
            <NavLink to="/settings/company" className="flex items-center gap-2 hover:text-white">
              <File size={16} /> Dados da Empresa
            </NavLink>
            <NavLink to="/settings/currency" className="flex items-center gap-2 hover:text-white">
              <DollarSign size={16} /> Moedas
            </NavLink>
            <NavLink to="/settings/bank-accounts" className="flex items-center gap-2 hover:text-white">
              <Landmark size={16} /> Contas Bancárias
            </NavLink>

            {Number(user?.role_id) === 1 && (
              <NavLink to="/settings/users" className="flex items-center gap-2 hover:text-white">
                <UserPlus size={18} /> Utilizadores
              </NavLink>
            )}

            <NavLink to="/settings/roles" className="flex items-center gap-2 hover:text-white">
              <UserCog size={16} /> Perfis de Acesso
            </NavLink>
            <NavLink to="/settings/security" className="flex items-center gap-2 hover:text-white">
              <Shield size={16} /> Segurança
            </NavLink>
            <NavLink to="/settings/documents" className="flex items-center gap-2 hover:text-white">
              <File size={16} /> Documentos e Modelos
            </NavLink>
            <NavLink to="/settings/notifications" className="flex items-center gap-2 hover:text-white">
              <Bell size={16} /> Notificações
            </NavLink>
            <NavLink to="/settings/logs" className="flex items-center gap-2 hover:text-white">
              <List size={16} /> Logs / Auditoria
            </NavLink>
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-blue-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-300 hover:text-red-500"
        >
          <LogOut size={18} /> Sair
        </button>
      </div>
    </aside>
  );
}

import { useState } from "react";
import {
  Home,
  Users,
  Briefcase,
  FileText,
  Coins,
  CreditCard,
  BookOpen,
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
  DollarSign,
  ArrowDownUp,
  Layers3, // novo ícone para tiers
  BarChart2,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { authService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export function Sidebar() {
  const { user } = useAuth();
  const [configOpen, setConfigOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false); // submenu sócios
  const [reportsOpen, setReportsOpen] = useState(false);

  const mainMenus = [
    { to: "/clients",       label: "Clientes",            icon: <Briefcase size={18} /> },
    { to: "/loans",         label: "Empréstimos",         icon: <FileText size={18} /> },
    { to: "/contributions", label: "Contribuições",       icon: <Coins size={18} /> },
    { to: "/payments",      label: "Pagamentos",          icon: <CreditCard size={18} /> },
    { to: "/ledger",        label: "Transacções do Fundo",icon: <BookOpen size={18} /> },
    { to: "/transfers",     label: "Transferencias Entre Contas", icon: <ArrowDownUp size={18} /> },
  ];

  const handleLogout = () => {
    authService.logout();
    window.location.href = "/login";
  };

  return (
    <aside className="w-64 bg-blue-950 text-blue-100 h-full flex flex-col shadow-lg">
      <div className="p-4 text-xl tracking-wide border-b border-blue-800">
        FININVEST
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <NavLink className="flex items-center gap-2 hover:text-white" to="/dashboard">
          <Home size={18} /> Dashboard
        </NavLink>

        {/* Submenu Sócios */}
        <button
          className="flex items-center justify-between w-full text-left hover:text-white"
          onClick={() => setMembersOpen(!membersOpen)}
        >
          <span className="flex items-center gap-2">
            <Users size={18} /> Sócios
          </span>
          {membersOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        

        {membersOpen && (
          <div className="ml-6 mt-1 space-y-1 text-sm">
            <NavLink to="/members" className="flex items-center gap-2 hover:text-white">
              <Users size={16}/> Lista de Sócios
            </NavLink>
            <NavLink to="/members/tiers" className="flex items-center gap-2 hover:text-white">
              <Layers3 size={16}/> Escalões de Quota
            </NavLink>
          </div>
        )}

        {/* Submenu Relatórios */}
<button
  className="flex items-center justify-between w-full text-left hover:text-white"
  onClick={() => setReportsOpen(!reportsOpen)}
>
  <span className="flex items-center gap-2">
    <BarChart2 size={18} /> Relatórios
  </span>
  {reportsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
</button>

{reportsOpen && (
  <div className="ml-6 mt-1 space-y-1 text-sm">
    <NavLink to="/reports" className="flex items-center gap-2 hover:text-white">
      <BarChart2 size={16}/> Visão Geral
    </NavLink>
    <NavLink to="/reports/contributions" className="flex items-center gap-2 hover:text-white">
      <Coins size={16}/> Contribuições
    </NavLink>
    <NavLink to="/reports/payments" className="flex items-center gap-2 hover:text-white">
      <CreditCard size={16}/> Pagamentos
    </NavLink>
    <NavLink to="/reports/members" className="flex items-center gap-2 hover:text-white">
      <Users size={16}/> Sócios
    </NavLink>
    <NavLink to="/reports/clients" className="flex items-center gap-2 hover:text-white">
      <Briefcase size={16}/> Clientes
    </NavLink>
    <NavLink to="/reports/loans" className="flex items-center gap-2 hover:text-white">
      <FileText size={16}/> Empréstimos
    </NavLink>
    <NavLink to="/reports/bank-accounts" className="flex items-center gap-2 hover:text-white">
      <Landmark size={16}/> Contas Bancárias
    </NavLink>
  </div>
)}

        {/* Outros módulos */}
        {mainMenus.map((m) => (
          <NavLink
            key={m.to}
            to={m.to}
            className="flex items-center gap-2 hover:text-white"
          >
            {m.icon} {m.label}
          </NavLink>
        ))}

        {/* Configurações */}
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
            <NavLink to="/settings/company"    className="flex items-center gap-2 hover:text-white"><File     size={16}/> Dados da Empresa</NavLink>
            <NavLink to="/settings/currency"   className="flex items-center gap-2 hover:text-white"><DollarSign size={16}/> Moedas</NavLink>
            <NavLink to="/settings/bank-accounts" className="flex items-center gap-2 hover:text-white"><Landmark size={16}/> Contas Bancárias</NavLink>

            {Number(user?.role_id) === 1 && (
              <NavLink to="/settings/users" className="flex items-center gap-2 hover:text-white">
                <UserPlus size={18}/> Utilizadores
              </NavLink>
            )}

            <NavLink to="/settings/roles"        className="flex items-center gap-2 hover:text-white"><UserCog size={16}/> Perfis de Acesso</NavLink>
            <NavLink to="/settings/security"     className="flex items-center gap-2 hover:text-white"><Shield size={16}/> Segurança</NavLink>
            <NavLink to="/settings/documents"    className="flex items-center gap-2 hover:text-white"><File   size={16}/> Documentos e Modelos</NavLink>
            <NavLink to="/settings/notifications"className="flex items-center gap-2 hover:text-white"><Bell   size={16}/> Notificações</NavLink>
            <NavLink to="/settings/logs"         className="flex items-center gap-2 hover:text-white"><List   size={16}/> Logs / Auditoria</NavLink>
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

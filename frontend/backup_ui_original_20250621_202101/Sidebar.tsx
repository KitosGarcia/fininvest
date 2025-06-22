import React, { useState } from 'react';
import { 
  Home, 
  Users, 
  CreditCard, 
  PiggyBank, 
  BarChart3, 
  BanknoteIcon, 
  ArrowLeftRight, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  LogOut
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

interface NavItem {
  title: string;
  icon: JSX.Element;
  path: string;
  badge?: number;
}

const Sidebar = ({ collapsed = false, onToggle }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
    if (onToggle) onToggle();
  };

  const navItems: NavItem[] = [
    { title: 'Dashboard', icon: <Home size={20} />, path: '/' },
    { title: 'Sócios', icon: <Users size={20} />, path: '/socios' },
    { title: 'Clientes', icon: <Users size={20} />, path: '/clientes' },
    { title: 'Empréstimos', icon: <CreditCard size={20} />, path: '/emprestimos' },
    { title: 'Contribuições', icon: <PiggyBank size={20} />, path: '/contribuicoes', badge: 3 },
    { title: 'Contas Bancárias', icon: <BanknoteIcon size={20} />, path: '/contas' },
    { title: 'Transferências', icon: <ArrowLeftRight size={20} />, path: '/transferencias' },
    { title: 'Relatórios', icon: <BarChart3 size={20} />, path: '/relatorios' },
    { title: 'Configurações', icon: <Settings size={20} />, path: '/configuracoes' },
  ];

  return (
    <div 
      className={`h-screen bg-sidebar transition-all duration-300 ease-in-out relative ${
        isCollapsed ? 'w-20' : 'w-64'
      } glass border-r border-sidebar-border`}
    >
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : ''}`}>
          {!isCollapsed && (
            <span className="text-xl font-orbitron font-bold text-sidebar-primary ml-2">
              FININVEST
            </span>
          )}
          {isCollapsed && (
            <span className="text-xl font-orbitron font-bold text-sidebar-primary">
              FI
            </span>
          )}
        </div>
        <button
          onClick={handleToggle}
          className="p-1 rounded-full hover:bg-sidebar-accent transition-colors duration-200"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <div className="py-4">
        <ul className="space-y-2 px-2">
          {navItems.map((item, index) => (
            <li key={index}>
              <Link
                to={item.path}
                className={`flex items-center p-3 rounded-lg hover:bg-sidebar-accent transition-colors duration-200 group ${
                  isCollapsed ? 'justify-center' : 'justify-between'
                }`}
              >
                <div className="flex items-center">
                  <span className={`text-sidebar-primary ${location.pathname === item.path ? 'animate-pulse-glow' : ''}`}>
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <span className={`ml-3 font-medium ${location.pathname === item.path ? 'text-sidebar-primary' : 'text-sidebar-foreground'}`}>
                      {item.title}
                    </span>
                  )}
                </div>
                {!isCollapsed && item.badge && (
                  <span className="bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
                {isCollapsed && item.badge && (
                  <span className="absolute top-1 right-1 bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold w-4 h-4 flex items-center justify-center rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="absolute bottom-0 w-full border-t border-sidebar-border p-4">
        <Link
          to="/logout"
          className={`flex items-center p-3 rounded-lg hover:bg-sidebar-accent transition-colors duration-200 ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut size={20} className="text-sidebar-foreground" />
          {!isCollapsed && (
            <span className="ml-3 font-medium text-sidebar-foreground">Sair</span>
          )}
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;


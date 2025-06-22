import React, { useState } from 'react';
import { Bell, Search, User, ChevronDown } from 'lucide-react';

const Topbar = () => {
  const [notifications, setNotifications] = useState(3);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex-1">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={18} className="text-muted-foreground" />
            </div>
            <input
              type="text"
              className="w-full py-2 pl-10 pr-4 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              placeholder="Pesquisar..."
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="relative p-2 rounded-full hover:bg-muted/50 transition-colors">
            <Bell size={20} />
            {notifications > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                {notifications}
              </span>
            )}
          </button>

          <div className="relative">
            <button
              className="flex items-center space-x-2 p-1 rounded-full hover:bg-muted/50 transition-colors"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <User size={18} className="text-primary" />
              </div>
              <span className="font-medium">Admin</span>
              <ChevronDown size={16} />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 glass border border-border rounded-lg shadow-lg z-10 animate-in fade-in slide-in-from-top-5">
                <div className="py-2 px-4 border-b border-border">
                  <p className="font-medium">Admin</p>
                  <p className="text-sm text-muted-foreground">admin@fininvest.com</p>
                </div>
                <ul className="py-2">
                  <li>
                    <a href="#" className="block px-4 py-2 hover:bg-muted/50 transition-colors">
                      Perfil
                    </a>
                  </li>
                  <li>
                    <a href="#" className="block px-4 py-2 hover:bg-muted/50 transition-colors">
                      Configurações
                    </a>
                  </li>
                  <li>
                    <a href="#" className="block px-4 py-2 text-destructive hover:bg-muted/50 transition-colors">
                      Sair
                    </a>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;


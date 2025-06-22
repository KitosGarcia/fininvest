import { Home, Settings } from 'lucide-react';

export function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-jarvis-panel text-white flex flex-col p-4 shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-jarvis-accent">FININVEST</h1>
      <nav className="flex-1">
        <ul className="space-y-4">
          <li className="flex items-center gap-3 hover:text-jarvis-accent cursor-pointer"><Home size={20}/> Dashboard</li>
          <li className="flex items-center gap-3 hover:text-jarvis-accent cursor-pointer"><Settings size={20}/> Configurações</li>
        </ul>
      </nav>
    </aside>
  );
}

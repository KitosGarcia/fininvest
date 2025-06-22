#!/usr/bin/env bash
# setup_finapp.sh — scaffolds ERP modern UI for Fininvest
set -e

echo "🔧 Instalar dependências..."
npm i react-router-dom lucide-react
npm i -D @vitejs/plugin-react

echo "📁 Criar estrutura de pastas..."
mkdir -p src/{layouts,pages,components/ui}

echo "📝 Gerar vite.config.ts"
cat > vite.config.ts <<'VITE'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
});
VITE

echo "📝 Gerar main.tsx"
cat > src/main.tsx <<'MAIN'
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
MAIN

echo "📝 Gerar App.tsx"
cat > src/App.tsx <<'APP'
import { Routes, Route } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import LoginPage from "@/pages/LoginPage";
import Dashboard from "@/pages/Dashboard";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
      </Route>
    </Routes>
  );
}
APP

echo "📝 Layout & UI components"
cat > src/layouts/MainLayout.tsx <<'LAY'
import { Sidebar } from "@/components/ui/Sidebar";
import { Topbar } from "@/components/ui/Topbar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="flex h-screen w-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Topbar />
        <main className="flex-1 overflow-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
LAY

cat > src/components/ui/Sidebar.tsx <<'SIDE'
import { Home, Users, FileText, LogOut } from "lucide-react";
import { NavLink } from "react-router-dom";

export function Sidebar() {
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
      </nav>
      <div className="p-4 border-t border-blue-800">
        <button className="flex items-center gap-2 text-red-300 hover:text-red-500">
          <LogOut size={18} /> Sair
        </button>
      </div>
    </aside>
  );
}
SIDE

cat > src/components/ui/Topbar.tsx <<'TOP'
export function Topbar() {
  return (
    <header className="h-14 border-b border-blue-800 px-6 flex items-center justify-between bg-blue-900">
      <div className="text-sm text-blue-200">Bem-vindo de volta 👋</div>
      <div className="text-sm text-blue-400">fininvest.app</div>
    </header>
  );
}
TOP

cat > src/pages/Dashboard.tsx <<'DASH'
export default function Dashboard() {
  return <h2 className="text-2xl">Dashboard</h2>;
}
DASH

echo "🚧 Dica: copie a LoginPage final do canvas para src/pages/LoginPage.tsx"
echo "💡 Ready!  ➜  npm run dev"
#!/usr/bin/env bash
# setup_finapp.sh — scaffolds ERP modern UI for Fininvest
set -e

echo "🔧 Instalar dependências..."
npm i react-router-dom lucide-react
npm i -D @vitejs/plugin-react

echo "📁 Criar estrutura de pastas..."
mkdir -p src/{layouts,pages,components/ui}

echo "📝 Gerar vite.config.ts"
cat > vite.config.ts <<'VITE'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
});
VITE

echo "📝 Gerar main.tsx"
cat > src/main.tsx <<'MAIN'
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
MAIN

echo "📝 Gerar App.tsx"
cat > src/App.tsx <<'APP'
import { Routes, Route } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import LoginPage from "@/pages/LoginPage";
import Dashboard from "@/pages/Dashboard";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
      </Route>
    </Routes>
  );
}
APP

echo "📝 Layout & UI components"
cat > src/layouts/MainLayout.tsx <<'LAY'
import { Sidebar } from "@/components/ui/Sidebar";
import { Topbar } from "@/components/ui/Topbar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="flex h-screen w-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Topbar />
        <main className="flex-1 overflow-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
LAY

cat > src/components/ui/Sidebar.tsx <<'SIDE'
import { Home, Users, FileText, LogOut } from "lucide-react";
import { NavLink } from "react-router-dom";

export function Sidebar() {
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
      </nav>
      <div className="p-4 border-t border-blue-800">
        <button className="flex items-center gap-2 text-red-300 hover:text-red-500">
          <LogOut size={18} /> Sair
        </button>
      </div>
    </aside>
  );
}
SIDE

cat > src/components/ui/Topbar.tsx <<'TOP'
export function Topbar() {
  return (
    <header className="h-14 border-b border-blue-800 px-6 flex items-center justify-between bg-blue-900">
      <div className="text-sm text-blue-200">Bem-vindo de volta 👋</div>
      <div className="text-sm text-blue-400">fininvest.app</div>
    </header>
  );
}
TOP

cat > src/pages/Dashboard.tsx <<'DASH'
export default function Dashboard() {
  return <h2 className="text-2xl">Dashboard</h2>;
}
DASH

echo "🚧 Dica: copie a LoginPage final do canvas para src/pages/LoginPage.tsx"
echo "💡 Ready!  ➜  npm run dev"

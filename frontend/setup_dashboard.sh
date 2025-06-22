#!/bin/bash

echo "📦 Instalando dependências..."
npm install -D tailwindcss postcss autoprefixer
npm install react-router-dom lucide-react @headlessui/react
npm install chart.js react-chartjs-2

echo "🔧 Configurando Tailwind..."
npx tailwindcss init -p

# Atualizar tailwind.config.js
cat > tailwind.config.js << 'EOF'
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        jarvis: {
          bg: '#050d1a',
          panel: '#0d1f35',
          accent: '#00d8ff',
          text: '#f9f9f9'
        }
      }
    }
  },
  plugins: [],
}
EOF

# Criar estrutura de diretórios
mkdir -p src/{components/layout,pages,styles}

# Criar index.css com tema dark
cat > src/styles/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-jarvis-bg text-jarvis-text font-sans;
}
EOF

# Criar Sidebar básico
cat > src/components/layout/Sidebar.tsx << 'EOF'
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
EOF

# Criar Topbar básico
cat > src/components/layout/Topbar.tsx << 'EOF'
export function Topbar() {
  return (
    <header className="h-16 bg-jarvis-panel flex items-center justify-end px-6 text-white shadow-md">
      <span>Olá, Admin</span>
    </header>
  );
}
EOF

# Criar Dashboard com um gráfico
cat > src/pages/Dashboard.tsx << 'EOF'
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale } from 'chart.js';
ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale);

export function Dashboard() {
  const data = {
    labels: ['21/04', '22/04', '23/04', '24/04', '25/04'],
    datasets: [{
      label: 'Liquidez',
      data: [100, 100, 100, 24, 0],
      borderColor: '#00d8ff',
      tension: 0.3
    }]
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-jarvis-bg min-h-screen">
      <h2 className="text-2xl font-semibold text-jarvis-accent">Dashboard</h2>
      <div className="bg-jarvis-panel p-4 rounded shadow">
        <Line data={data} />
      </div>
    </div>
  );
}
EOF

# Criar App.tsx
cat > src/App.tsx << 'EOF'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { Dashboard } from './pages/Dashboard';

function App() {
  return (
    <Router>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
EOF

echo "✅ Setup concluído! Agora executa:"
echo "1. Importa 'src/styles/index.css' no teu 'main.tsx'"
echo "2. Corre 'npm run dev' para ver o dashboard Jarvis Mode ⚡"

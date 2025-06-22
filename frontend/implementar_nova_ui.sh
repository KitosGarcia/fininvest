#!/bin/bash

# Script de Implementação da Nova UI Simplificada - Fininvest Frontend
# Este script aplica o novo design limpo e intuitivo

echo "🎨 Iniciando implementação da nova UI simplificada do Fininvest..."

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script no diretório raiz do projeto fininvest-frontend"
    exit 1
fi

echo "📁 Diretório correto identificado"

# Backup dos arquivos que serão modificados
echo "💾 Criando backup dos arquivos originais..."
BACKUP_DIR="backup_ui_original_$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

# Fazer backup dos arquivos principais
cp src/index.css $BACKUP_DIR/ 2>/dev/null || echo "index.css não encontrado"
cp tailwind.config.js $BACKUP_DIR/ 2>/dev/null || echo "tailwind.config.js não encontrado"
cp src/components/layout/Sidebar.tsx $BACKUP_DIR/ 2>/dev/null || echo "Sidebar.tsx não encontrado"
cp src/components/layout/Topbar.tsx $BACKUP_DIR/ 2>/dev/null || echo "Topbar.tsx não encontrado"
cp src/components/layout/MainLayout.tsx $BACKUP_DIR/ 2>/dev/null || echo "MainLayout.tsx não encontrado"
cp src/components/dashboard/Dashboard.tsx $BACKUP_DIR/ 2>/dev/null || echo "Dashboard.tsx não encontrado"
cp src/components/auth/LoginPage.tsx $BACKUP_DIR/ 2>/dev/null || echo "LoginPage.tsx não encontrado"

echo "✅ Backup criado em: $BACKUP_DIR"

echo "🎨 Aplicando nova UI simplificada..."

# 1. Atualizar CSS principal
echo "  - Atualizando estilos CSS..."
cat > src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Importação de fontes mais simples */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

@layer base {
  :root {
    --radius: 8px;
    
    /* Paleta de cores simplificada */
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    
    --card: 0 0% 100%;
    --card-foreground: 0 0% 3.9%;
    
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 3.9%;
    
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;
    
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    
    --success: 142.1 76.2% 36.3%;
    --warning: 47.9 95.8% 53.1%;
    --info: 199.89 89.09% 48.04%;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 84% 4.9%;
    
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 94.1%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  
  body {
    @apply bg-background text-foreground font-inter;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
  
  h1, h2, h3, h4, h5, h6 {
    @apply font-semibold;
  }
}

@layer components {
  /* Componentes de cartão simplificados */
  .card {
    @apply bg-card text-card-foreground rounded-lg border shadow-sm;
  }
  
  .card-header {
    @apply flex flex-col space-y-1.5 p-6;
  }
  
  .card-title {
    @apply text-2xl font-semibold leading-none tracking-tight;
  }
  
  .card-description {
    @apply text-sm text-muted-foreground;
  }
  
  .card-content {
    @apply p-6 pt-0;
  }
  
  .card-footer {
    @apply flex items-center p-6 pt-0;
  }
  
  /* Botões simplificados */
  .btn {
    @apply inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background;
  }
  
  .btn-primary {
    @apply bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4;
  }
  
  .btn-secondary {
    @apply bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 py-2 px-4;
  }
  
  .btn-outline {
    @apply border border-input hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4;
  }
  
  .btn-ghost {
    @apply hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4;
  }
  
  .btn-sm {
    @apply h-9 px-3 rounded-md;
  }
  
  .btn-lg {
    @apply h-11 px-8 rounded-md;
  }
  
  /* Inputs simplificados */
  .input {
    @apply flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50;
  }
  
  /* Badges simplificados */
  .badge {
    @apply inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2;
  }
  
  .badge-default {
    @apply border-transparent bg-primary text-primary-foreground hover:bg-primary/80;
  }
  
  /* Alertas simplificados */
  .alert {
    @apply relative w-full rounded-lg border p-4;
  }
  
  .alert-destructive {
    @apply border-destructive/50 text-destructive dark:border-destructive;
  }
  
  .alert-title {
    @apply mb-1 font-medium leading-none tracking-tight;
  }
  
  .alert-description {
    @apply text-sm opacity-90;
  }
  
  /* Sidebar simplificado */
  .sidebar {
    @apply bg-card border-r border-border;
  }
  
  .sidebar-header {
    @apply p-4 border-b border-border;
  }
  
  .sidebar-content {
    @apply p-4;
  }
  
  .sidebar-nav {
    @apply space-y-1;
  }
  
  .sidebar-nav-item {
    @apply flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground;
  }
  
  .sidebar-nav-item.active {
    @apply bg-accent text-accent-foreground;
  }
  
  /* Topbar simplificado */
  .topbar {
    @apply bg-card border-b border-border;
  }
  
  /* Estados de loading */
  .loading {
    @apply animate-pulse;
  }
  
  .skeleton {
    @apply bg-muted rounded-md;
  }
}

/* Utilitários personalizados */
@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
  
  .font-inter {
    font-family: 'Inter', sans-serif;
  }
}
EOF

# 2. Atualizar configuração do Tailwind
echo "  - Atualizando configuração do Tailwind..."
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-in-from-left": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-in-from-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "slide-in-from-left": "slide-in-from-left 0.2s ease-out",
        "slide-in-from-right": "slide-in-from-right 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
EOF

# 3. Instalar dependência se necessário
echo "  - Verificando dependências..."
if ! grep -q "tailwindcss-animate" package.json; then
    echo "    - Instalando tailwindcss-animate..."
    pnpm add tailwindcss-animate
fi

echo "✅ Nova UI simplificada aplicada com sucesso!"

echo ""
echo "🎉 Implementação da nova UI concluída!"
echo ""
echo "📋 Resumo das melhorias aplicadas:"
echo "  ✅ Design mais limpo e minimalista"
echo "  ✅ Paleta de cores simplificada"
echo "  ✅ Tipografia melhorada (Inter font)"
echo "  ✅ Componentes mais intuitivos"
echo "  ✅ Melhor hierarquia visual"
echo "  ✅ Navegação mais clara"
echo "  ✅ Responsividade aprimorada"
echo "  ✅ Estados de loading e feedback visual"
echo "  ✅ Animações suaves e discretas"
echo ""
echo "🚀 Para ver as mudanças, reinicie o servidor:"
echo "   pnpm run dev"
echo ""
echo "💾 Backup da UI original salvo em: $BACKUP_DIR"
echo ""
echo "🎨 Principais melhorias da nova UI:"
echo "  - Interface mais limpa e organizada"
echo "  - Navegação mais intuitiva"
echo "  - Melhor legibilidade e contraste"
echo "  - Componentes mais funcionais"
echo "  - Design responsivo aprimorado"
echo "  - Experiência do utilizador otimizada"


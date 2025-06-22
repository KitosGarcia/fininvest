import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services/api';

// Componentes de Layout
import MainLayout from './components/layout/MainLayout';

// Componentes de Autenticação
import LoginPage from './components/auth/LoginPage';

// Componentes de Dashboard
import Dashboard from './components/dashboard/Dashboard';

// Componentes de Sócios
import MemberList from './components/members/MemberList';

// Componentes de Clientes
import ClientList from './components/clients/ClientList';

// Componentes de Empréstimos
import LoanList from './components/loans/LoanList';

// Componentes de Contribuições
import ContributionList from './components/contributions/ContributionList';

// Componentes de Contas Bancárias
import BankAccountList from './components/bank-accounts/BankAccountList';

// Componentes de Transferências
import TransferList from './components/transfers/TransferList';

// Componentes de Automação
import AutomationPanel from './components/automation/AutomationPanel';

// Componentes de Relatórios
import ReportsPanel from './components/reports/ReportsPanel';

// Componente para rotas protegidas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // Verificar se o usuário está autenticado
  const isAuthenticated = authService.isAuthenticated();
  
  if (!isAuthenticated) {
    // Redirecionar para a página de login se não estiver autenticado
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Rota pública - Login */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Rotas protegidas - Precisam de autenticação */}
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        } />

        {/* Rotas de Sócios */}
        <Route path="/socios" element={
          <ProtectedRoute>
            <MainLayout>
              <MemberList />
            </MainLayout>
          </ProtectedRoute>
        } />

        {/* Rotas de Clientes */}
        <Route path="/clientes" element={
          <ProtectedRoute>
            <MainLayout>
              <ClientList />
            </MainLayout>
          </ProtectedRoute>
        } />

        {/* Rotas de Empréstimos */}
        <Route path="/emprestimos" element={
          <ProtectedRoute>
            <MainLayout>
              <LoanList />
            </MainLayout>
          </ProtectedRoute>
        } />

        {/* Rotas de Contribuições */}
        <Route path="/contribuicoes" element={
          <ProtectedRoute>
            <MainLayout>
              <ContributionList />
            </MainLayout>
          </ProtectedRoute>
        } />

        {/* Rotas de Contas Bancárias */}
        <Route path="/contas" element={
          <ProtectedRoute>
            <MainLayout>
              <BankAccountList />
            </MainLayout>
          </ProtectedRoute>
        } />

        {/* Rotas de Transferências */}
        <Route path="/transferencias" element={
          <ProtectedRoute>
            <MainLayout>
              <TransferList />
            </MainLayout>
          </ProtectedRoute>
        } />

        {/* Rotas de Automação */}
        <Route path="/automacao" element={
          <ProtectedRoute>
            <MainLayout>
              <AutomationPanel />
            </MainLayout>
          </ProtectedRoute>
        } />

        {/* Rotas de Relatórios */}
        <Route path="/relatorios" element={
          <ProtectedRoute>
            <MainLayout>
              <ReportsPanel />
            </MainLayout>
          </ProtectedRoute>
        } />

        {/* Rotas de Configurações */}
        <Route path="/configuracoes" element={
          <ProtectedRoute>
            <MainLayout>
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Configurações</h1>
                <p className="text-muted-foreground">Página de configurações em desenvolvimento.</p>
              </div>
            </MainLayout>
          </ProtectedRoute>
        } />
        
        {/* Redirecionar para o dashboard se a rota não existir */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;


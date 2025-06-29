import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// ⚠️  Troca @ pelos paths relativos do teu setup Vite
import LoginPage          from "./pages/LoginPage";
import { Dashboard }      from "./pages/Dashboard";
import MainLayout         from "./components/layout/MainLayout";
import PrivateRoute       from "./routes/PrivateRoute";      // ← import atualizado

import CompanyPage        from "./pages/settings/CompanyPage";
import CurrencyPage       from "./pages/settings/CurrencyPage";
import BankAccountPage    from "./pages/settings/BankAccountPage";
import UsersPage          from "./pages/settings/UsersPage";
import MembersPage        from "./components/members/MembersPage";
import ClientsPage        from "./components/clients/ClientsPage";
import LoansPage          from "./components/loans/LoansPage";
import ContributionsPage  from "./components/contributions/ContributionsPage";
import PaymentsPage       from "./components/payments/PaymentsPage";
import LedgerPage         from "./components/ledger/LedgerPage";
import TransfersPage      from "./components/transfers/TransfersPage";
import TiersPage from "./pages/TiersPage"




export default function App() {
  return (
     <>
      <Toaster position="top-center" />
    <Router>
      <Routes>
        {/* rota pública */}
        <Route path="/login" element={<LoginPage />} />

        {/* rotas privadas (main layout) */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"           element={<Dashboard />} />

          <Route path="settings/company"    element={<CompanyPage />} />
          <Route path="settings/currency"   element={<CurrencyPage />} />
          <Route path="settings/bank-accounts" element={<BankAccountPage />} />
          <Route path="settings/users"      element={<UsersPage />} />

          <Route path="/members"       element={<PrivateRoute><MembersPage /></PrivateRoute>} />
          <Route path="/clients"       element={<PrivateRoute><ClientsPage /></PrivateRoute>} />
          <Route path="/loans"         element={<PrivateRoute><LoansPage /></PrivateRoute>} />
          <Route path="/contributions" element={<PrivateRoute><ContributionsPage /></PrivateRoute>} />
          <Route path="/payments"      element={<PrivateRoute><PaymentsPage /></PrivateRoute>} />
          <Route path="/ledger"        element={<PrivateRoute><LedgerPage /></PrivateRoute>} />
          <Route path="/transfers"     element={<PrivateRoute><TransfersPage /></PrivateRoute>} />
          <Route path="/members/tiers" element={<PrivateRoute><TiersPage /></PrivateRoute>} />

        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
     </>
  );
}

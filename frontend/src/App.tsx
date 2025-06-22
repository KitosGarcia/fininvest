import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// ⚠️  Troca @ pelos paths relativos do teu setup Vite
import LoginPage          from "./pages/LoginPage";
import { Dashboard }      from "./pages/Dashboard";
import MainLayout         from "./components/layout/MainLayout";
import PrivateRoute       from "./routes/PrivateRoute";      // ← import atualizado

import CompanyPage        from "./pages/settings/CompanyPage";
import CurrencyPage       from "./pages/settings/CurrencyPage";
import BankAccountPage    from "./pages/settings/BankAccountPage";
import UsersPage          from "./pages/settings/UsersPage";

export default function App() {
  return (
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
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

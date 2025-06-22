// 📁 src/pages/CompanyPage.tsx
import { useEffect, useState } from "react";
import axios from "../../services/api";
import CompanyForm from "../../components/company/CompanyForm";

export default function CompanyPage() {
  const [company, setCompany] = useState(null);

  useEffect(() => {
    axios.get("/company")
      .then(res => setCompany(res.data))
      .catch(err => console.error("Erro ao buscar dados da empresa", err));
  }, []);

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Dados da Empresa</h1>
      <CompanyForm initialData={company} />
    </div>
  );
}

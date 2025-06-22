import { useEffect, useState } from "react";
import axios from "../../services/api";
import CompanyView from "../../components/company/CompanyView";
import CompanyForm from "../../components/company/CompanyForm";
import { authService } from "../../services/api";      // para obter utilizador
import { Pencil } from "lucide-react";

export default function CompanyPage() {
  const [data, setData] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const user = authService.getCurrentUser();      // { role: 'admin', ... }

  const load = () => axios.get("/company").then(r=> setData(r.data));

  useEffect(() => {
  const fetchCompany = async () => {
    try {
      const { data } = await axios.get("/company");
      setData(data);
    } catch (err) {
      console.error("Erro ao carregar dados da empresa:", err);
    }
  };
  fetchCompany();
}, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-jarvis-accent">Dados da Empresa</h1>
        {user?.role === "admin" && (
          <button onClick={()=>setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-jarvis-accent text-black rounded">
            <Pencil size={16}/> Editar
          </button>
        )}
      </div>

      <CompanyView data={data} />

      {showModal && (
        <CompanyForm
          initial={data || {}}
          onClose={()=>setShowModal(false)}
          onSaved={(d)=>{ setData(d); setShowModal(false); }}
        />
      )}
    </div>
  );
}

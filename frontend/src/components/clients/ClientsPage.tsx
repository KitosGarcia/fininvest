import { useEffect, useState } from "react";
import { clientService } from "../../services/api/clientService";
import ClientFormModal from "./ClientFormModal";
import ClientViewModal from "./ClientViewModal";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

interface Client {
  client_id: number;
  name: string;
  document_id: string;
  client_type: string;
  email?: string;
  phone?: string;
  status: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewClient, setViewClient] = useState<Client | null>(null);

  const [filters, setFilters] = useState({
    name: "",
    document_id: "",
    client_type: "",
    email: "",
    phone: "",
    status: ""
  });

  const loadClients = async () => {
    try {
      const data = await clientService.getAll();
      setClients(data);
    } catch (err) {
      console.error("Erro ao buscar clientes:", err);
    }
  };

  useEffect(() => { loadClients(); }, []);

  const openNewClient = () => {
    setFormMode("create");
    setSelectedClient(null);
    setModalOpen(true);
  };

  const openEditClient = (client: Client) => {
    setFormMode("edit");
    setSelectedClient(client);
    setModalOpen(true);
  };

  const openViewClient = (client: Client) => {
    setViewClient(client);
    setViewModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedClient(null);
  };

  const updateFilter = (field: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const clearAllFilters = () => {
    setFilters({
      name: "",
      document_id: "",
      client_type: "",
      email: "",
      phone: "",
      status: ""
    });
  };

  const filteredClients = clients.filter((c) => {
    return (
      c.name.toLowerCase().includes(filters.name.toLowerCase()) &&
      c.document_id.toLowerCase().includes(filters.document_id.toLowerCase()) &&
      c.client_type.toLowerCase().includes(filters.client_type.toLowerCase()) &&
      (c.email || "").toLowerCase().includes(filters.email.toLowerCase()) &&
      (c.phone || "").includes(filters.phone) &&
      c.status.toLowerCase().includes(filters.status.toLowerCase())
    );
  });

  return (
    <div className="text-white p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-jarvis.text">Clientes</h2>
        <div className="flex items-center gap-2">
          <Button onClick={openNewClient}>Novo Cliente</Button>
          {Object.values(filters).some(v => v !== "") && (
            <Button variant="ghost" onClick={clearAllFilters}>Limpar todos os filtros ✕</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-6 gap-4 mb-4">
        {Object.keys(filters).map((field) => (
          <Input
            key={field}
            name={field}
            placeholder={`Filtrar por ${field}`}
            value={filters[field as keyof typeof filters]}
            onChange={(e) => updateFilter(field as keyof typeof filters, e.target.value)}
          />
        ))}
      </div>

      <table className="min-w-full text-sm border border-jarvis.panel bg-jarvis.bg/50 rounded shadow">
        <thead className="bg-jarvis.panel text-jarvis.text">
          <tr>
            <th className="p-2 text-left">Nome</th>
            <th className="p-2 text-left">Doc.ID</th>
            <th className="p-2 text-left">Tipo</th>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Telefone</th>
            <th className="p-2 text-center">Estado</th>
            <th className="p-2 text-center">Ações</th>
          </tr>
        </thead>

        <tbody>
          {filteredClients.length === 0 ? (
            <tr>
              <td colSpan={7} className="p-4 text-center text-jarvis.text/70">
                Nenhum cliente encontrado.
              </td>
            </tr>
          ) : (
            filteredClients.map((c) => (
              <tr key={c.client_id} className="border-t border-jarvis.panel hover:bg-jarvis.bg/30">
                <td className="p-2">{c.name}</td>
                <td className="p-2">{c.document_id}</td>
                <td className="p-2 capitalize">{c.client_type}</td>
                <td className="p-2">{c.email || "—"}</td>
                <td className="p-2">{c.phone || "—"}</td>
                <td className="p-2 text-center">{c.status}</td>
                <td className="p-2 text-center space-x-2">
                  <Button size="sm" variant="ghost" onClick={() => openEditClient(c)}>Editar</Button>
                  <Button size="sm" variant="ghost" onClick={() => openViewClient(c)}>👁 Ver</Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <ClientFormModal
        key={modalOpen ? `${formMode}-${selectedClient?.client_id ?? "new"}` : "closed"}
        isOpen={modalOpen}
        onClose={closeModal}
        onSuccess={loadClients}
        mode={formMode}
        initialData={selectedClient}
      />

      {viewModalOpen && viewClient && (
        <ClientViewModal
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          client={viewClient}
        />
      )}
    </div>
  );
}

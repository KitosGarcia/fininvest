// src/components/clients/ClientsPage.tsx
import { useEffect, useState } from "react";
import { clientService } from "../../services/api/clientService";
import ClientFormModal from "./ClientFormModal";

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
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] = useState<Client | null>(null);

  const load = async () => {
    try {
      const data = await clientService.getAll();
      setClients(data);
    } catch (err) {
      console.error("Erro ao buscar clientes:", err);
    }
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setMode("create");
    setSelected(null);
    setModalOpen(true);
  };

  const openEdit = (c: Client) => {
    setMode("edit");
    setSelected(c);
    setModalOpen(true);
  };

  return (
    <div className="text-white p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Clientes</h2>
        <button
          onClick={openNew}
          className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded"
        >
          Novo Cliente
        </button>
      </div>

      <table className="w-full text-sm border border-blue-800 bg-blue-950 rounded shadow">
        <thead className="bg-blue-900">
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
          {clients.map((c) => (
            <tr key={c.client_id} className="border-t border-blue-800">
              <td className="p-2">{c.name}</td>
              <td className="p-2">{c.document_id}</td>
              <td className="p-2 capitalize">{c.client_type}</td>
              <td className="p-2">{c.email ?? "—"}</td>
              <td className="p-2">{c.phone ?? "—"}</td>
              <td className="p-2 text-center">{c.status}</td>
              <td className="p-2 text-center">
                <button
                  onClick={() => openEdit(c)}
                  className="text-blue-400 hover:text-blue-600"
                >
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ClientFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={load}
        mode={mode}
        initialData={selected}
      />
    </div>
  );
}

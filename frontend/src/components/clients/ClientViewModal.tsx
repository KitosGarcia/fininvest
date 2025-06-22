// src/components/clients/ClientViewModal.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Client } from "../../types/client";

interface ClientViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
}

export default function ClientViewModal({ isOpen, onClose, client }: ClientViewModalProps) {
  if (!client) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-blue-950 text-white print:bg-white print:text-black">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold print:text-black">
            Ficha de Cliente
          </DialogTitle>
        </DialogHeader>

        <div id="printable-client" className="mt-4 print:p-0 print:mt-0 text-sm space-y-6">
  <h1 className="print-title hidden print:block">Ficha de Cliente</h1>

  <div className="grid grid-cols-2 gap-4">
    <div><strong>Nome:</strong> {client.name}</div>
    <div><strong>Documento:</strong> {client.document_id}</div>
    <div><strong>Email:</strong> {client.email || "—"}</div>
    <div><strong>Telefone:</strong> {client.phone || "—"}</div>
    <div><strong>Tipo:</strong> {client.client_type}</div>
    <div><strong>Estado:</strong> {client.status}</div>
    <div><strong>Data Nascimento:</strong> {client.birth_date?.split("T")[0]}</div>
    <div><strong>Género:</strong> {client.gender}</div>
    <div><strong>Nacionalidade:</strong> {client.nationality}</div>
    <div><strong>Estado Civil:</strong> {client.marital_status}</div>
    <div><strong>Profissão:</strong> {client.occupation}</div>
    <div><strong>Rendimento:</strong> {client.income_range}</div>
    <div><strong>PEP:</strong> {client.pep_flag ? "Sim" : "Não"}</div>
    <div className="col-span-2"><strong>Morada:</strong> {client.address}</div>
  </div>

  <div className="mt-6 flex justify-end print:hidden">
    <button
      onClick={() => window.print()}
      className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white"
    >
      Imprimir Ficha
    </button>
  </div>
</div>
      </DialogContent>
    </Dialog>
  );
}

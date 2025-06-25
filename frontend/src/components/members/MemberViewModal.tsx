// src/components/members/MemberViewModal.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";

interface MemberViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: any;
}

export default function MemberViewModal({
  isOpen,
  onClose,
  member,
}: MemberViewModalProps) {
  const printView = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Ficha de Sócio</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            h2 { text-align: center; margin-bottom: 20px; }
            .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
            .row { margin-bottom: 12px; }
            .label { font-weight: bold; color: #333; }
            .value { margin-left: 6px; color: #444; }
          </style>
        </head>
        <body>
          <h2>Ficha de Sócio</h2>
          <div class="grid">
            ${renderField("Nome", member.name)}
            ${renderField("Documento", member.document_id)}
            ${renderField("Email", member.email)}
            ${renderField("Telefone", member.phone)}
            ${renderField("Morada", member.address)}
            ${renderField("Data Nasc.", member.birth_date)}
            ${renderField("Género", member.gender)}
            ${renderField("Nacionalidade", member.nationality)}
            ${renderField("Estado civil", member.marital_status)}
            ${renderField("Profissão", member.occupation)}
            ${renderField("Rendimento", member.income_range)}
            ${renderField("PEP", member.pep_flag ? "Sim" : "Não")}
            ${renderField("Data Entrada", member.join_date)}
            ${renderField("Estado", member.status)}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const renderField = (label: string, value: any) => {
    return `
      <div class="row">
        <span class="label">${label}:</span>
        <span class="value">${value ?? "—"}</span>
      </div>
    `;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-blue-950 text-blue-100 max-w-2xl border border-blue-800 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ficha de Sócio</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
          {[
            ["Nome", member.name],
            ["Documento", member.document_id],
            ["Email", member.email],
            ["Telefone", member.phone],
            ["Morada", member.address],
            ["Data Nasc.", member.birth_date],
            ["Género", member.gender],
            ["Nacionalidade", member.nationality],
            ["Estado civil", member.marital_status],
            ["Profissão", member.occupation],
            ["Rendimento", member.income_range],
            ["PEP", member.pep_flag ? "Sim" : "Não"],
            ["Data Entrada", member.join_date],
            ["Estado", member.status],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-col">
              <span className="text-xs text-blue-300">{label}</span>
              <span className="text-base">{value || "—"}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-6">
          <Button onClick={printView} variant="outline">
            Imprimir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

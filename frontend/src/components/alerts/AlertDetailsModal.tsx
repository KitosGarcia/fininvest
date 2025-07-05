import { Dialog } from "@radix-ui/react-dialog";
import { AlertCircle } from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

interface Props {
  alert: {
    alert_id: number;
    type: string;
    category?: string;
    message: string;
    description: string;
    is_read: boolean;
    created_at: string;
    member_id?: number;
  };
  onClose: () => void;
}

export default function AlertDetailsModal({ alert, onClose }: Props) {
  const handleMarkAsRead = async () => {
    try {
      await api.put(`/alerts/${alert.alert_id}/read`);
      toast.success("Alerta marcado como lido.");
      onClose();
    } catch {
      toast.error("Erro ao marcar como lido.");
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
        <div className="bg-white text-black rounded-lg shadow-lg p-6 w-full max-w-md">
          <div className="flex items-center mb-4">
            <AlertCircle className="text-red-600 mr-2" />
            <h2 className="text-lg font-semibold">Detalhes do Alerta</h2>
          </div>
          <div className="space-y-2 text-sm">
            <p><strong>Mensagem:</strong> {alert.message}</p>
            <p><strong>Descrição:</strong> {alert.description}</p>
            <p><strong>Tipo:</strong> {alert.type}</p>
            {alert.category && <p><strong>Categoria:</strong> {alert.category}</p>}
            {alert.member_id && <p><strong>Sócio:</strong> {alert.member_id}</p>}
            <p><strong>Data:</strong> {new Date(alert.created_at).toLocaleString()}</p>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleMarkAsRead}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Marcar como lido
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import toast from "react-hot-toast";
import AlertDetailsModal from "./AlertDetailsModal";
import api from "../../services/api";

interface Alert {
  alert_id: number;
  type: string;
  category?: string;
  message: string;
  description: string;
  is_read: boolean;
  created_at: string;
  member_id?: number;
}

export default function AlertsBell() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const fetchAlerts = async () => {
    try {
      const res = await api.get("/alerts?is_read=false");
      setAlerts(res.data);
    } catch {
      toast.error("Erro ao buscar alertas.");
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleViewAlert = (alert: Alert) => {
    setSelectedAlert(alert);
    setDropdownOpen(false);
  };

  const handleCloseModal = () => {
    setSelectedAlert(null);
    fetchAlerts(); // Atualiza contagem
  };

  return (
    <div className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="relative text-white"
      >
        <Bell className="w-6 h-6" />
        {alerts.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-xs rounded-full px-1">
            {alerts.length}
          </span>
        )}
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white text-black shadow rounded z-50">
          {alerts.length === 0 ? (
            <div className="p-3 text-sm">Sem novos alertas.</div>
          ) : (
            alerts.map((alert) => (
              <button
                key={alert.alert_id}
                onClick={() => handleViewAlert(alert)}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm border-b"
              >
                <div className="font-semibold">{alert.message}</div>
                <div className="text-xs text-gray-600">{new Date(alert.created_at).toLocaleString()}</div>
              </button>
            ))
          )}
        </div>
      )}

      {selectedAlert && (
        <AlertDetailsModal alert={selectedAlert} onClose={handleCloseModal} />
      )}
    </div>
  );
}

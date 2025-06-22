import { useEffect, useState } from "react";
import CurrencyTable from "../../components/currency/CurrencyTable";
import CurrencyFormModal from "../../components/currency/CurrencyFormModal";
import { Currency } from "@/types";
import api from "../../services/api";

export default function CurrencyPage() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selected, setSelected] = useState<Currency | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchCurrencies = async () => {
    try {
      const response = await api.get("/currencies");
      setCurrencies(response.data);
    } catch (err) {
      console.error("Erro ao buscar moedas", err);
    }
  };

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const handleEdit = (currency: Currency) => {
    setSelected(currency);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setSelected(null);
    setModalOpen(true);
  };

  const handleSuccess = () => {
    setModalOpen(false);
    fetchCurrencies();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-jarvis-accent">Gestão de Moedas</h2>

      </div>

      <CurrencyTable currencies={currencies} onEdit={handleEdit} />

      <CurrencyFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
        currency={selected}
      />
    </div>
  );
}

import { useEffect, useState } from "react";
import axios from "../../services/api";
import CurrencyFormModal from "./CurrencyFormModal";
import { Currency } from "@/types";

export default function CurrencyTable() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchCurrencies = async () => {
    try {
      const res = await axios.get("/currencies"); // certifique-se que o endpoint está correto
      setCurrencies(res.data);
    } catch (err) {
      console.error("Erro ao buscar moedas:", err);
    }
  };

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const handleEdit = (currency: Currency) => {
    setSelectedCurrency(currency);
    setShowModal(true);
  };

  const handleAdd = () => {
    setSelectedCurrency(null);
    setShowModal(true);
  };

  const handleClose = () => {
    setSelectedCurrency(null);
    setShowModal(false);
  };

  const handleSuccess = () => {
    fetchCurrencies();
    handleClose();
  };

  return (
    <div className="max-w-4xl mx-auto mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Moedas</h2>
        <button
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Nova Moeda
        </button>
      </div>

      <table className="w-full text-white bg-blue-950 border border-blue-700">
        <thead>
          <tr className="bg-blue-900 text-left">
            <th className="p-2">Código</th>
            <th className="p-2">Nome</th>
            <th className="p-2">Símbolo</th>
            <th className="p-2">Principal</th>
            <th className="p-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {currencies.map((currency) => (
            <tr key={currency.code} className="border-t border-blue-800">
              <td className="p-2">{currency.code}</td>
              <td className="p-2">{currency.name}</td>
              <td className="p-2">{currency.symbol}</td>
              <td className="p-2">
                {currency.is_main ? (
                  <span className="text-green-400">✔</span>
                ) : (
                  "-"
                )}
              </td>
              <td className="p-2">
                <button
                  onClick={() => handleEdit(currency)}
                  className="text-blue-400 hover:underline"
                >
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <CurrencyFormModal
          isOpen={showModal}
          currency={selectedCurrency}
          onClose={handleClose}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}

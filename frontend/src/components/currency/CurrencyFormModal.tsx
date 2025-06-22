import { useEffect, useState } from "react";
import axios from "../../services/api";

interface Currency {
  code: string;
  name: string;
  symbol: string;
  is_main: boolean;
}

interface Props {
  isOpen: boolean;
  currency: Currency | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CurrencyFormModal({ isOpen, currency, onClose, onSuccess }: Props) {
  const [formData, setFormData] = useState<Currency>({
    code: "",
    name: "",
    symbol: "",
    is_main: false,
  });

 // Preenche o formulário se estiver em modo de edição
useEffect(() => {
  if (currency) {
    // garantes sempre string ou boolean
    setFormData({
      code:    currency.code   || "",
      name:    currency.name   || "",
      symbol:  currency.symbol || "",
      is_main: currency.is_main ?? false,
    });
  } else {
    setFormData({
      code: "",
      name: "",
      symbol: "",
      is_main: false,
    });
  }
}, [currency]);

  if (!isOpen) return null; // não renderiza se modal fechado

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (currency) {
        // Atualizar moeda existente
        await axios.put(`/currencies/${currency.code}`, formData);
      } else {
        // Criar nova moeda
        await axios.post("/currencies", formData);
      }

      onSuccess(); // Atualiza lista
      onClose();   // Fecha modal
    } catch (err) {
      console.error("Erro ao salvar moeda:", err);
      alert("Erro ao salvar a moeda.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-blue-950 p-6 rounded-lg w-full max-w-md border border-blue-700 shadow-xl">
        <h2 className="text-lg font-bold text-white mb-4">
          {currency ? "Editar Moeda" : "Nova Moeda"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 text-white">
          <div>
            <label className="block text-sm mb-1">Código</label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              disabled={!!currency} // não permite editar o código se for edição
              className="w-full p-2 rounded bg-blue-900 border border-blue-700"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Nome</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 rounded bg-blue-900 border border-blue-700"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Símbolo</label>
            <input
              type="text"
              name="symbol"
              value={formData.symbol}
              onChange={handleChange}
              className="w-full p-2 rounded bg-blue-900 border border-blue-700"
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_main"
              checked={formData.is_main}
              onChange={handleChange}
              className="accent-green-500"
            />
            <label className="text-sm">Moeda Principal</label>
          </div>

          <div className="flex justify-between mt-6">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-red-300 hover:text-red-500"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

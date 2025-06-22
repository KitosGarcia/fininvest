import { useEffect, useState } from "react";
import axios from "../../services/api";

interface BankAccount {
  account_id?: number;
  account_name: string;
  bank_name: string;
  iban: string;
  account_type: string;
  initial_balance: number;
  currency: string;
  is_active: boolean;
}

interface Props {
  isOpen: boolean;
  account: BankAccount | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BankAccountFormModal({ isOpen, account, onClose, onSuccess }: Props) {
  const [formData, setFormData] = useState<BankAccount>({
    account_name: "",
    bank_name: "",
    iban: "",
    account_type: "",
    initial_balance: 0,
    currency: "EUR",
    is_active: true,
  });

  useEffect(() => {
    if (account) {
      setFormData(account);
    } else {
      setFormData({
        account_name: "",
        bank_name: "",
        iban: "",
        account_type: "",
        initial_balance: 0,
        currency: "EUR",
        is_active: true,
      });
    }
  }, [account]);

  if (!isOpen) return null;

 const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value, type, checked } = e.target;

  setFormData(prev => ({
    ...prev,
    [name]:
      type === "checkbox" ? checked :
      name === "initial_balance" ? parseFloat(value) || 0 :
      value,
  }));
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (account) {
        await axios.put(`/accounts/${account.account_id}`, formData);
      } else {
        await axios.post("/accounts", formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Erro ao salvar conta bancária:", err);
      alert("Erro ao salvar a conta bancária.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-blue-950 p-6 rounded-lg w-full max-w-md border border-blue-700 shadow-xl">
        <h2 className="text-lg font-bold text-white mb-4">
          {account ? "Editar Conta Bancária" : "Nova Conta Bancária"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 text-white">
          <div>
            <label className="block text-sm mb-1">Nome da Conta</label>
            <input
              type="text"
              name="account_name"
              value={formData.account_name}
              onChange={handleChange}
              required
              className="w-full p-2 rounded bg-blue-900 border border-blue-700"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Banco</label>
            <input
              type="text"
              name="bank_name"
              value={formData.bank_name}
              onChange={handleChange}
              className="w-full p-2 rounded bg-blue-900 border border-blue-700"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">IBAN</label>
            <input
              type="text"
              name="iban"
              value={formData.iban}
              onChange={handleChange}
              className="w-full p-2 rounded bg-blue-900 border border-blue-700"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Tipo de Conta</label>
            <input
              type="text"
              name="account_type"
              value={formData.account_type}
              onChange={handleChange}
              className="w-full p-2 rounded bg-blue-900 border border-blue-700"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Moeda</label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="w-full p-2 rounded bg-blue-900 border border-blue-700"
            >
              <option value="EUR">EUR</option>
              <option value="AOA">AOA</option>
              <option value="USD">USD</option>
              {/* Adiciona mais moedas conforme necessário */}
            </select>
          </div>

          {!account && (
            <div>
              <label className="block text-sm mb-1">Saldo Inicial</label>
              <input
                type="number"
                name="initial_balance"
                value={formData.initial_balance}
                onChange={handleChange}
                className="w-full p-2 rounded bg-blue-900 border border-blue-700"
                step="0.01"
              />
            </div>
          )}

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

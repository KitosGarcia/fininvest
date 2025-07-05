import { useEffect, useState } from "react";
import axios from "../../services/api";
import BankAccountFormModal from "./BankAccountFormModal";

interface BankAccount {
  account_id: number;
  account_name: string;
  bank_name: string;
  iban: string;
  account_type: string;
  initial_balance: number;
  current_balance: number | string; // Pode vir como string do backend
  currency: string;
  is_active: boolean;
}

export default function BankAccountTable() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAccounts = async () => {
    try {
      const response = await axios.get("/bank-accounts");
      setAccounts(response.data);
    } catch (err) {
      console.error("Erro ao buscar contas bancárias:", err);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const openNewModal = () => {
    setSelectedAccount(null);
    setIsModalOpen(true);
  };

  const openEditModal = (account: BankAccount) => {
    setSelectedAccount(account);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja inativar esta conta?")) return;

    try {
      await axios.delete(`/bank-accounts/${id}`);
      fetchAccounts();
    } catch (err) {
      console.error("Erro ao inativar conta:", err);
      alert("Erro ao inativar a conta bancária.");
    }
  };

  const formatCurrency = (value: number | string, currency: string) =>
    `${(parseFloat(value as any) || 0).toFixed(2)} ${currency}`;

  return (
    <div className="text-white">
      <div className="flex justify-between mb-4">
        <h2 className="text-lg font-semibold">Contas Bancárias</h2>
        <button
          onClick={openNewModal}
          className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded"
        >
          Nova Conta
        </button>
      </div>

      <table className="w-full text-sm border border-blue-800 bg-blue-950 rounded shadow-md">
        <thead className="bg-blue-900 text-white">
          <tr>
            <th className="p-2 text-left">Nome</th>
            <th className="p-2 text-left">Banco</th>
            <th className="p-2 text-left">IBAN</th>
            <th className="p-2 text-left">Tipo</th>
            <th className="p-2 text-right">Saldo</th>
            <th className="p-2 text-center">Ativa</th>
            <th className="p-2 text-center">Ações</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((acc) => (
            <tr key={acc.account_id} className="border-t border-blue-800">
              <td className="p-2">{acc.account_name}</td>
              <td className="p-2">{acc.bank_name}</td>
              <td className="p-2">{acc.iban}</td>
              <td className="p-2">{acc.account_type}</td>
              <td className="p-2 text-right">{formatCurrency(acc.current_balance, acc.currency)}</td>
              <td className="p-2 text-center">{acc.is_active ? "✅" : "❌"}</td>
              <td className="p-2 text-center space-x-2">
                <button onClick={() => openEditModal(acc)} className="text-blue-400 hover:text-blue-600">Editar</button>
                <button onClick={() => handleDelete(acc.account_id)} className="text-red-400 hover:text-red-600">Inativar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <BankAccountFormModal
        isOpen={isModalOpen}
        account={selectedAccount}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchAccounts}
      />
    </div>
  );
}

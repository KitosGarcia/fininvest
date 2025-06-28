import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@radix-ui/react-dialog";
import { Contribution } from "../../services/api/contributionService";
import { BankAccount, getBankAccounts } from "../../services/api/bankAccountService";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import api from "../../services/api";
import { Input } from "../ui/input";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  contributions: Contribution[]; // contribuições pendentes do sócio
  memberName: string;
  memberId: number;
  onSuccess: () => void;
}

const ContributionPaymentModal: React.FC<Props> = ({
  isOpen,
  onClose,
  contributions,
  memberName,
  memberId,
  onSuccess
}) => {
  const [amount, setAmount] = useState("");
  const [bankAccountId, setBankAccountId] = useState<number | null>(null);
  const [method, setMethod] = useState("");
  const [notes, setNotes] = useState("");
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getBankAccounts().then(setBankAccounts).catch(() =>
      toast.error("Erro ao buscar contas bancárias")
    );
  }, []);

  const handleSubmit = async () => {
    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0) {
      return toast.error("Valor inválido");
    }
    if (!bankAccountId) return toast.error("Selecione uma conta bancária");

    try {
      setLoading(true);
      await api.post("/contribution-payments", {
        member_id: memberId,
        amount: numericAmount,
        bank_account_id: bankAccountId,
        method,
        notes,
      });

      toast.success("Pagamento registrado com sucesso");
      onClose();
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao registrar pagamento");
    } finally {
      setLoading(false);
    }
  };

  const previewDistribution = () => {
    let remaining = parseFloat(amount || "0");
    return contributions.map((c) => {
      const due = c.amount_due - c.amount_paid;
      const used = remaining >= due ? due : remaining;
      remaining = Math.max(0, remaining - used);
      return { ...c, used };
    });
  };

  const distributed = previewDistribution();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-jarvis.panel p-6 rounded-md w-[700px]">
        <h2 className="text-xl font-semibold mb-4 text-jarvis.text">
          Pagamento para: {memberName}
        </h2>

        <div className="space-y-3">
          <div>
            <label className="block text-sm">Valor Pago</label>
            <Input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Ex: 120.00"
              type="number"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm">Conta Bancária</label>
            <select
              value={bankAccountId || ""}
              onChange={(e) => setBankAccountId(parseInt(e.target.value))}
              className="w-full p-2 rounded bg-jarvis.bg text-jarvis.text"
            >
              <option value="">-- Selecione --</option>
              {bankAccounts.map((acc) => (
                <option key={acc.account_id} value={acc.account_id}>
                  {acc.account_name} - {acc.bank_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm">Método de Pagamento</label>
            <Input value={method} onChange={(e) => setMethod(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm">Observações</label>
            <textarea
              className="w-full p-2 rounded bg-jarvis.bg text-jarvis.text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="mt-6">
            <h4 className="font-semibold text-jarvis.text mb-2">Distribuição:</h4>
            <ul className="space-y-1 text-sm">
              {distributed.map((c) => (
                <li key={c.contribution_id}>
                  {format(new Date(c.reference_month), "MMMM/yyyy")} ({c.type}) —{" "}
                  {c.used.toFixed(2)} €
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            disabled={loading}
            className="bg-jarvis.accent text-white px-4 py-2 rounded hover:opacity-90"
            onClick={handleSubmit}
          >
            Confirmar Pagamento
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContributionPaymentModal;

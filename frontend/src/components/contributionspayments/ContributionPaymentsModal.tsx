import React, { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { format } from "date-fns";
import { toast } from "react-hot-toast";

import { Contribution } from "../../services/api/contributionService";
import { BankAccount, getBankAccounts } from "../../services/api/bankAccountService";
import { getPaymentMethods, PaymentMethod } from "../../services/api/paymentMethodService";
import { uploadReceipt } from "../../services/api/uploadService";
import api from "../../services/api";
import { Input } from "../ui/input";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  contributions: Contribution[];
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
  onSuccess,
}) => {
  if (!contributions || !Array.isArray(contributions)) return null;

  const [amount, setAmount] = useState("");
  const [bankAccountId, setBankAccountId] = useState<number | null>(null);
  const [method, setMethod] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getBankAccounts()
      .then(setBankAccounts)
      .catch(() => toast.error("Erro ao buscar contas bancárias"));

    getPaymentMethods()
      .then(setPaymentMethods)
      .catch(() => toast.error("Erro ao buscar métodos de pagamento"));
  }, []);

  useEffect(() => {
    if (amount && parseFloat(amount) > 0) {
      let remaining = parseFloat(amount);
      const autoSelected: number[] = [];
      for (const c of contributions) {
        const due = c.amount_due - c.amount_paid;
        if (remaining >= due) {
          autoSelected.push(c.contribution_id);
          remaining -= due;
        } else if (remaining > 0) {
          autoSelected.push(c.contribution_id);
          break;
        }
      }
      setSelected(autoSelected);
    }
  }, [amount]);

  const toggleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const getSelectedTotal = () =>
    contributions
      .filter((c) => selected.includes(c.contribution_id))
      .reduce((sum, c) => sum + (c.amount_due - c.amount_paid), 0);

  const handleSubmit = async () => {
    if (!selected.length) return toast.error("Selecione ao menos uma contribuição");
    if (!bankAccountId) return toast.error("Selecione uma conta bancária");
    if (!method) return toast.error("Selecione um método de pagamento");

    try {
      setLoading(true);
      console.log("📎 Ficheiro selecionado:", receiptFile);
      const uploadedUrl = receiptFile ? await uploadReceipt(receiptFile) : null;

      const payload = {
        member_id: memberId,
        amount: parseFloat(amount),
        bank_account_id: bankAccountId,
        method,
        notes,
        payment_date: paymentDate,
        receipt_url: uploadedUrl,
        contribution_ids: selected,
      };

      await api.post("/contribution-payments", payload);
      toast.success("Pagamento registrado com sucesso");
      onClose();
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao registrar pagamento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 z-40" />
        <Dialog.Content className="bg-jarvis.panel p-6 rounded-md w-[900px] max-h-[90vh] overflow-y-auto fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-jarvis.text">
            Pagamento para: <span className="text-white">{memberName}</span>
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm mb-1">Valor a Pagar</label>
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Ex: 120.00"
                type="number"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Data do Pagamento</label>
              <Input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Conta Bancária</label>
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
              <label className="block text-sm mb-1">Comprovativo (opcional)</label>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm mb-1">Método de Pagamento</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full p-2 rounded bg-jarvis.bg text-jarvis.text"
              >
                <option value="">-- Selecione --</option>
                {paymentMethods.map((m) => (
                  <option key={m.method_id || m.method_id} value={m.description || m.description}>
                    {m.description || m.description}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm mb-1">Observações</label>
              <textarea
                className="w-full p-2 rounded bg-jarvis.bg text-jarvis.text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <h4 className="font-semibold text-jarvis.text mb-2">Contribuições pendentes:</h4>
          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="text-left border-b border-jarvis.bg">
                <th></th>
                <th>Mês</th>
                <th>Tipo</th>
                <th>Valor em dívida</th>
              </tr>
            </thead>
            <tbody>
              {contributions.map((c) => {
                const isSelected = selected.includes(c.contribution_id);
                const pending = c.amount_due - c.amount_paid;
                return (
                  <tr key={c.contribution_id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(c.contribution_id)}
                      />
                    </td>
                    <td>{format(new Date(c.reference_month), "MMMM yyyy")}</td>
                    <td>{c.type}</td>
                    <td>{pending.toFixed(2)} AOA</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="flex justify-between text-jarvis.text">
            <span>
              <strong>Total Selecionado:</strong> {getSelectedTotal().toFixed(2)} AOA
            </span>
            <div>
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
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ContributionPaymentModal;

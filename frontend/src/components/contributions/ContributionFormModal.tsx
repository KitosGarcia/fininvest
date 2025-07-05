import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { contributionService } from "../../services/api/contributionService";
import { memberService } from "../../services/api/memberService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ContributionFormModal({ isOpen, onClose, onSuccess }: Props) {
  const [memberId, setMemberId] = useState("");
  const [referenceMonth, setReferenceMonth] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("quota");
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const data = await memberService.getAll();
        setMembers(data);
      } catch (err) {
        toast.error("Erro ao buscar sócios");
      }
    };
    fetchMembers();
  }, []);

  const calculateDueDate = (reference: string) => {
    const [year, month] = reference.split("-").map(Number);
    const nextMonth = new Date(year, month, 1);
    let count = 0;
    let day = 1;
    while (count < 8) {
      const date = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), day);
      const weekday = date.getDay();
      if (weekday !== 0 && weekday !== 6) count++;
      day++;
    }
    return new Date(nextMonth.getFullYear(), nextMonth.getMonth(), day - 1)
      .toISOString()
      .split("T")[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!memberId || !referenceMonth || !amount || isNaN(parseFloat(amount))) {
      toast.error("Preencha todos os campos obrigatórios corretamente.");
      return;
    }

    const due_date = calculateDueDate(referenceMonth);

    try {
      await contributionService.create({
        member_id: parseInt(memberId),
        reference_month: `${referenceMonth}`,
        amount_due: parseFloat(amount),
        due_date,
        type,
      });
      toast.success("Contribuição criada com sucesso.");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Erro ao criar contribuição");
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/100 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 transform -translate-x-1/2 -translate-y-1/2 bg-jarvis.panel text-white rounded-lg shadow-lg p-6 w-full max-w-md space-y-4">
          <Dialog.Title className="text-xl font-semibold">Nova Contribuição</Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label>Sócio:</label>
              <select
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                className="w-full bg-blue-900 text-white p-2 rounded"
                required
              >
                <option value="">Selecione um sócio</option>
                {members.map((m: any) => (
                  <option key={m.member_id} value={m.member_id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Tipo:</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-blue-900 text-white p-2 rounded"
              >
                <option value="quota">Quota</option>
                <option value="taxa">Taxa</option>
              </select>
            </div>

            <div>
              <label>Mês de Referência:</label>
              <input
                type="date"
                value={referenceMonth}
                onChange={(e) => setReferenceMonth(e.target.value)}
                className="w-full bg-blue-900 text-white p-2 rounded"
                required
              />
            </div>

            <div>
              <label>Valor a Pagar:</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-blue-900 text-white p-2 rounded"
                required
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-700 hover:bg-green-800 rounded"
              >
                Criar
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

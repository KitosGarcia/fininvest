import { useEffect, useState } from "react";
import { Dialog } from "@radix-ui/react-dialog";
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

  // Carregar sócios
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

  // Calcula a data limite como 8º dia útil do mês seguinte
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
    return new Date(nextMonth.getFullYear(), nextMonth.getMonth(), day - 1).toISOString().split("T")[0];
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

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <form
          onSubmit={handleSubmit}
          className="bg-jarvis.panel p-6 rounded shadow-md text-white w-full max-w-md space-y-4"
        >
          <h2 className="text-xl font-semibold">Nova Contribuição</h2>

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
            <button type="submit" className="px-4 py-2 bg-green-700 hover:bg-green-800 rounded">
              Criar
            </button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}

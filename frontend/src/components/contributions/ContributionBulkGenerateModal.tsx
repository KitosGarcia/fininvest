import { useState } from "react";
import toast from "react-hot-toast";
import { Dialog } from "@radix-ui/react-dialog";
import { contributionService } from "../../services/api/contributionService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ContributionBulkGenerateModal({
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [feeAmount, setFeeAmount] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!year || !feeAmount || isNaN(parseFloat(feeAmount))) {
      toast.error("Preencha o ano e o valor da taxa corretamente.");
      return;
    }

    try {
await contributionService.generateBulk({
  year: parseInt(year.toString()),
  tax_amount: parseFloat(feeAmount),
});


      toast.success("Contribuições geradas com sucesso!");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Erro ao gerar contribuições");
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
          <h2 className="text-xl font-semibold">Geração em Massa</h2>

          <div>
            <label htmlFor="year">Ano de Referência:</label>
            <input
              id="year"
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="w-full bg-blue-900 text-white p-2 rounded"
              required
              min="2000"
              max="2100"
            />
          </div>

          <div>
            <label htmlFor="fee">Valor da Taxa:</label>
            <input
              id="fee"
              type="number"
              value={feeAmount}
              onChange={(e) => setFeeAmount(e.target.value)}
              className="w-full bg-blue-900 text-white p-2 rounded"
              required
              min="0"
              step="0.01"
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
              Gerar
            </button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}

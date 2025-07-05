import React, { useEffect, useState } from "react";
import { format, isBefore, parseISO } from "date-fns";
import { pt } from "date-fns/locale";
import { toast } from "react-hot-toast";

import contributionService, {
  Contribution,
} from "../../services/api/contributionService";

import ContributionFormModal from "./ContributionFormModal";
import ContributionPaymentModal from "../contributionspayments/ContributionPaymentsModal";
import ContributionPaymentViewModal from "../contributionspayments/ContributionPaymentViewModal";
import ContributionBulkGenerateModal from "./ContributionBulkGenerateModal";

const ContributionsPage: React.FC = () => {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [filtered, setFiltered] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedContribution, setSelectedContribution] = useState<Contribution | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  const [filters, setFilters] = useState({ member: "", type: "", status: "", month: "" });

  const loadContributions = async () => {
    try {
      setLoading(true);
      const res = await contributionService.getAll();
      setContributions(res);
      setFiltered(res);
    } catch {
      toast.error("Erro ao carregar contribuições");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const { member, type, status, month } = filters;
    const filteredData = contributions.filter((c) => {
      const refMonth = format(parseISO(c.reference_month), "yyyy-MM");
      return (
        (!member || `${c.member_id} - ${c.member_name}`.toLowerCase().includes(member.toLowerCase())) &&
        (!type || c.type === type) &&
        (!status || c.status === status) &&
        (!month || refMonth === month)
      );
    });
    setFiltered(filteredData);
  };

  const handleFilterChange = (field: string, value: string) =>
    setFilters((prev) => ({ ...prev, [field]: value }));

  const openEdit = (c: Contribution) => {
    if (c.amount_paid === 0) {
      setSelectedContribution(c);
      setIsModalOpen(true);
    }
  };

  const openPayment = (c: Contribution) => {
    setSelectedContribution(c);
    setIsPaymentOpen(true);
  };

  const openViewPayments = (c: Contribution) => {
    setSelectedContribution(c);
    setIsViewOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Deseja anular esta contribuição?")) return;
    try {
      await contributionService.delete(id);
      toast.success("Contribuição anulada com sucesso");
      loadContributions();
    } catch {
      toast.error("Erro ao anular contribuição");
    }
  };

  const handleNew = () => {
    setSelectedContribution(null);
    setIsModalOpen(true);
  };

  const formatDate = (d: string) => format(parseISO(d), "dd/MM/yyyy", { locale: pt });
  const formatMonth = (m: string) => format(parseISO(m), "MMMM yyyy", { locale: pt });
  const isLate = (due: string, status: string) => status !== "pago" && isBefore(parseISO(due), new Date());

  useEffect(() => { loadContributions(); }, []);
  useEffect(() => { applyFilters(); }, [filters, contributions]);

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-jarvis.text">Contribuições</h1>
        <div className="space-x-2">
          <button onClick={handleNew} className="rounded bg-jarvis.accent px-4 py-2 text-white hover:opacity-90">
            Nova Contribuição
          </button>
          <button onClick={() => setIsBulkModalOpen(true)} className="rounded bg-purple-700 px-4 py-2 text-white hover:opacity-90">
            Gerar em Massa
          </button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <input
          className="rounded border bg-jarvis.panel px-2 py-1 text-jarvis.text"
          placeholder="Filtrar por sócio"
          value={filters.member}
          onChange={(e) => handleFilterChange("member", e.target.value)}
        />
        <select
          className="rounded border bg-jarvis.panel px-2 py-1 text-jarvis.text"
          value={filters.type}
          onChange={(e) => handleFilterChange("type", e.target.value)}
        >
          <option value="">Todos os tipos</option>
          <option value="quota">Quota</option>
          <option value="taxa">Taxa</option>
        </select>
        <select
          className="rounded border bg-jarvis.panel px-2 py-1 text-jarvis.text"
          value={filters.status}
          onChange={(e) => handleFilterChange("status", e.target.value)}
        >
          <option value="">Todos os status</option>
          <option value="por_pagar">Por Pagar</option>
          <option value="parcial">Parcial</option>
          <option value="pago">Pago</option>
          <option value="cancelado">Cancelado</option>
        </select>
        <input
          type="month"
          className="rounded border bg-jarvis.panel px-2 py-1 text-jarvis.text"
          value={filters.month}
          onChange={(e) => handleFilterChange("month", e.target.value)}
        />
      </div>

      {loading ? (
        <p className="text-gray-400">Carregando...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-jarvis.panel text-sm text-jarvis.text">
            <thead className="bg-jarvis.bg text-left text-xs uppercase">
              <tr>
                {["ID", "Sócio", "Tipo", "Referente", "Vencimento", "Valor", "Pago", "Status", "Ações"].map((h) => (
                  <th key={h} className="px-4 py-2">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.contribution_id} className="border-t border-jarvis.bg">
                  <td className="px-4 py-2">{c.contribution_id}</td>
                  <td className="px-4 py-2">{`${c.member_id} - ${c.member_name || ""}`}</td>
                  <td className="px-4 py-2">{c.type}</td>
                  <td className="px-4 py-2">{formatMonth(c.reference_month)}</td>
                  <td className="px-4 py-2">
                    {formatDate(c.due_date)}
                    {c.status === "pago" ? (
                      <span className="ml-2 font-semibold text-green-500">(Pago)</span>
                    ) : isLate(c.due_date, c.status) ? (
                      <span className="ml-2 font-semibold text-red-500">(Atrasado)</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-2">{Number(c.amount_due).toFixed(2)} AOA</td>
                  <td className="px-4 py-2">{Number(c.amount_paid).toFixed(2)}</td>
                  <td className="px-4 py-2">{c.status}</td>
                  <td className="space-x-2 px-4 py-2">
                    {c.amount_paid === 0 && (
                      <>
                        <button className="text-blue-400 hover:underline" onClick={() => openEdit(c)}>Editar</button>
                        <button className="text-red-400 hover:underline" onClick={() => handleDelete(c.contribution_id)}>Anular</button>
                      </>
                    )}
                    {(c.status === "por_pagar" || c.status === "parcial") && (
                      <button className="text-yellow-400 hover:underline" onClick={() => openPayment(c)}>Pagar</button>
                    )}
                    {c.amount_paid > 0 && (
                      <button className="text-green-400 hover:underline" onClick={() => openViewPayments(c)}>Ver Pagamentos</button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-center text-gray-400">
                    Nenhuma contribuição encontrada com os filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <ContributionFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialData={selectedContribution}
          onSuccess={loadContributions}
        />
      )}

      {isPaymentOpen && selectedContribution && (
        <ContributionPaymentModal
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          memberId={selectedContribution.member_id}
          memberName={selectedContribution.member_name || ""}
          contributions={contributions.filter((c) => c.member_id === selectedContribution.member_id && c.status !== "pago" && c.status !== "cancelado")}
          onSuccess={loadContributions}
        />
      )}

      {isViewOpen && selectedContribution && (
        <ContributionPaymentViewModal
          open={isViewOpen}
          onClose={() => setIsViewOpen(false)}
          contributionId={selectedContribution.contribution_id}
          contributionAmount={selectedContribution.amount_due}
        />
      )}

      {isBulkModalOpen && (
        <ContributionBulkGenerateModal
          isOpen={isBulkModalOpen}
          onClose={() => setIsBulkModalOpen(false)}
          onSuccess={loadContributions}
        />
      )}
    </div>
  );
};

export default ContributionsPage;

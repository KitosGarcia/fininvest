import React, { useEffect, useState } from "react";
import { Contribution } from "../../services/api/contributionService";
import contributionService from "../../services/api/contributionService";
import { format, isBefore, parseISO } from "date-fns";
import { pt } from "date-fns/locale";
import { toast } from "react-hot-toast";
import ContributionFormModal from "./ContributionFormModal";

const ContributionsPage: React.FC = () => {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [filtered, setFiltered] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContribution, setSelectedContribution] = useState<Contribution | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    member: "",
    type: "",
    status: "",
    month: ""
  });

  const loadContributions = async () => {
    try {
      setLoading(true);
      const res = await contributionService.getAll();
      setContributions(res);
      setFiltered(res);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar contribuições");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const { member, type, status, month } = filters;
    const filteredData = contributions.filter(c => {
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

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const openEdit = (contribution: Contribution) => {
    if (contribution.amount_paid === 0) {
      setSelectedContribution(contribution);
      setIsModalOpen(true);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Deseja anular esta contribuição?")) return;
    try {
      await contributionService.delete(id);
      toast.success("Contribuição anulada com sucesso");
      loadContributions();
    } catch (err) {
      toast.error("Erro ao anular contribuição");
    }
  };

  const handleNew = () => {
    setSelectedContribution(null);
    setIsModalOpen(true);
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "dd/MM/yyyy", { locale: pt });
    } catch {
      return dateStr;
    }
  };

  const formatMonth = (monthStr: string) => {
    try {
      return format(parseISO(monthStr), "MMMM yyyy", { locale: pt });
    } catch {
      return monthStr;
    }
  };

  const isLate = (dueDate: string, status: string) => {
    try {
      if (status === "pago") return false;
      return isBefore(parseISO(dueDate), new Date());
    } catch {
      return false;
    }
  };

  useEffect(() => {
    loadContributions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, contributions]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-jarvis.text">Contribuições</h1>
        <button
          onClick={handleNew}
          className="bg-jarvis.accent text-white px-4 py-2 rounded hover:opacity-90"
        >
          Nova Contribuição
        </button>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <input
          type="text"
          placeholder="Filtrar por sócio"
          value={filters.member}
          onChange={e => handleFilterChange("member", e.target.value)}
          className="px-2 py-1 border rounded bg-jarvis.panel text-jarvis.text"
        />
        <select
          value={filters.type}
          onChange={e => handleFilterChange("type", e.target.value)}
          className="px-2 py-1 border rounded bg-jarvis.panel text-jarvis.text"
        >
          <option value="">Todos os tipos</option>
          <option value="quota">Quota</option>
          <option value="taxa">Taxa</option>
        </select>
        <select
          value={filters.status}
          onChange={e => handleFilterChange("status", e.target.value)}
          className="px-2 py-1 border rounded bg-jarvis.panel text-jarvis.text"
        >
          <option value="">Todos os status</option>
          <option value="por_pagar">Por Pagar</option>
          <option value="parcial">Parcial</option>
          <option value="pago">Pago</option>
          <option value="cancelado">Cancelado</option>
        </select>
        <input
          type="month"
          value={filters.month}
          onChange={e => handleFilterChange("month", e.target.value)}
          className="px-2 py-1 border rounded bg-jarvis.panel text-jarvis.text"
        />
      </div>

      {loading ? (
        <p className="text-gray-400">Carregando...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-jarvis.panel text-sm text-jarvis.text">
            <thead className="bg-jarvis.bg text-left uppercase text-xs">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Sócio</th>
                <th className="px-4 py-2">Tipo</th>
                <th className="px-4 py-2">Referente</th>
                <th className="px-4 py-2">Vencimento</th>
                <th className="px-4 py-2">Valor</th>
                <th className="px-4 py-2">Pago</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Ações</th>
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
                      <span className="ml-2 text-green-500 font-semibold">(Pago)</span>
                    ) : isLate(c.due_date, c.status) ? (
                      <span className="ml-2 text-red-500 font-semibold">(Atrasado)</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-2">{Number(c.amount_due).toFixed(2)} AOA</td>
                  <td className="px-4 py-2">{Number(c.amount_paid).toFixed(2)} AOA</td>
                  <td className="px-4 py-2">{c.status}</td>
                  <td className="px-4 py-2 space-x-2">
                    {c.amount_paid === 0 && (
                      <>
                        <button className="text-blue-400 hover:underline" onClick={() => openEdit(c)}>
                          Editar
                        </button>
                        <button className="text-red-400 hover:underline" onClick={() => handleDelete(c.contribution_id)}>
                          Anular
                        </button>
                      </>
                    )}
                    {(c.status === "por_pagar" || c.status === "parcial") && (
                      <button className="text-yellow-400 hover:underline">
                        Pagar
                      </button>
                    )}
                    {c.amount_paid > 0 && (
                      <button className="text-green-400 hover:underline">
                        Ver Pagamentos
                      </button>
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
    </div>
  );
};

export default ContributionsPage;

import React, { useEffect, useState } from 'react';
import contributionService, { Contribution } from '../../services/api/contributionService';
import { Input } from '../../components/ui/input';
import { Select, SelectItem } from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import { Download } from 'lucide-react';
import { exportToCSV, exportToPDF } from '../../utils/exportUtils';
import { format } from 'date-fns';
import {
  SelectTrigger,
  SelectValue,
  SelectContent
} from '../../components/ui/select';

const ContributionReportPage = () => {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [filtered, setFiltered] = useState<Contribution[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const data = await contributionService.getAll();
        setContributions(data);
        setFiltered(data);
      } catch (error) {
        console.error('Erro ao buscar contribuições:', error);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    let result = contributions;

    if (search)
      result = result.filter((c) =>
        c.member_id.toString().includes(search)
      );

    if (typeFilter && typeFilter !== 'all')
      result = result.filter((c) => c.type === typeFilter);

    if (statusFilter && statusFilter !== 'all')
      result = result.filter((c) => c.status === statusFilter);

    setFiltered(result);
  }, [search, typeFilter, statusFilter, contributions]);

  const getExportData = () =>
    filtered.map((c) => ({
      'ID Sócio': c.member_id,
      Tipo: c.type === 'quota' ? 'Quota' : 'Taxa',
      'Mês de Referência': c.reference_month,
      'Data Vencimento': format(new Date(c.due_date), 'dd/MM/yyyy'),
      Valor: Number(c.amount_due || 0).toFixed(2),
      'Valor Pago': Number(c.amount_paid || 0).toFixed(2),
      Estado: c.status,
    }));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-jarvis-text">Relatório de Contribuições</h1>

      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <Input
          placeholder="Buscar por ID do Sócio"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />

        <Select value={typeFilter} onValueChange={setTypeFilter}>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Todos os Tipos" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">Todos os Tipos</SelectItem>
    <SelectItem value="quota">Quota</SelectItem>
    <SelectItem value="taxa">Taxa</SelectItem>
  </SelectContent>
</Select>

<Select value={statusFilter} onValueChange={setStatusFilter}>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Todos os Estados" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">Todos os Estados</SelectItem>
    <SelectItem value="por_pagar">Por Pagar</SelectItem>
    <SelectItem value="parcial">Parcial</SelectItem>
    <SelectItem value="pago">Pago</SelectItem>
    <SelectItem value="cancelado">Cancelado</SelectItem>
  </SelectContent>
</Select>

        <div className="ml-auto flex gap-2">
          <Button onClick={() => exportToCSV(getExportData(), 'relatorio_contribuicoes')}>
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
          <Button onClick={() => exportToPDF(getExportData(), 'relatorio_contribuicoes', 'Relatório de Contribuições')}>
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl bg-jarvis-panel">
        <table className="min-w-full text-sm text-jarvis-text">
          <thead className="bg-jarvis-bg text-left">
            <tr>
              <th className="px-4 py-2">ID Sócio</th>
              <th className="px-4 py-2">Tipo</th>
              <th className="px-4 py-2">Mês de Referência</th>
              <th className="px-4 py-2">Data Vencimento</th>
              <th className="px-4 py-2">Valor</th>
              <th className="px-4 py-2">Valor Pago</th>
              <th className="px-4 py-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.contribution_id} className="border-t border-jarvis-bg hover:bg-jarvis-accent/5">
                <td className="px-4 py-2">{c.member_id}</td>
                <td className="px-4 py-2 capitalize">{c.type}</td>
                <td className="px-4 py-2">{c.reference_month}</td>
                <td className="px-4 py-2">{format(new Date(c.due_date), 'dd/MM/yyyy')}</td>
                <td className="px-4 py-2">€ {Number(c.amount_due || 0).toFixed(2)}</td>
                <td className="px-4 py-2">€ {Number(c.amount_paid || 0).toFixed(2)}</td>
                <td className="px-4 py-2 capitalize">{c.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center text-gray-400 py-8">Nenhuma contribuição encontrada.</div>
        )}
      </div>
    </div>
  );
};

export default ContributionReportPage;

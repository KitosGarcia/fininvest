import React, { useEffect, useState } from 'react';
import { Button } from '../../components/ui/button';
import { LoanFormModal } from './LoanFormModal';
import { LoanDetailsModal } from './LoanDetailsModal';
import loanService from '../../services/api/loanService';
import { Card, CardContent } from '../../components/ui/card';
import { formatCurrency } from '../../utils/formaters';

const LoansPage: React.FC = () => {
  const [loans, setLoans] = useState([]);
  const [filters, setFilters] = useState({
    loanId: '',
    clientName: '',
    status: '',
    startDate: '',
    endDate: '',
  });
  const [showForm, setShowForm] = useState(false);
  const [viewingLoanId, setViewingLoanId] = useState<number | null>(null);

  const fetchData = async () => {
    const query = new URLSearchParams();

    if (filters.loanId) query.append('loanId', filters.loanId);
    if (filters.clientName) query.append('clientName', filters.clientName);
    if (filters.status) query.append('status', filters.status);
    if (filters.startDate) query.append('startDate', filters.startDate);
    if (filters.endDate) query.append('endDate', filters.endDate);

    const data = await loanService.getAll(query.toString());
    setLoans(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFilter = () => {
    fetchData();
  };

  const handleClearFilters = () => {
    setFilters({
      loanId: '',
      clientName: '',
      status: '',
      startDate: '',
      endDate: '',
    });
    fetchData();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Empréstimos</h1>
        <Button onClick={() => setShowForm(true)}>Novo Pedido</Button>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <input
          type="text"
          name="loanId"
          value={filters.loanId}
          onChange={handleInputChange}
          placeholder="ID Empréstimo"
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="clientName"
          value={filters.clientName}
          onChange={handleInputChange}
          placeholder="Nome do Cliente"
          className="border p-2 rounded"
        />
        <select
          name="status"
          value={filters.status}
          onChange={handleInputChange}
          className="border p-2 rounded"
        >
          <option value="">Todos</option>
          <option value="pendente">Pendente</option>
          <option value="aprovado">Aprovado</option>
          <option value="rejeitado">Rejeitado</option>
          <option value="desembolsado">Desembolsado</option>
        </select>
        <input
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={handleInputChange}
          className="border p-2 rounded"
        />
        <input
          type="date"
          name="endDate"
          value={filters.endDate}
          onChange={handleInputChange}
          className="border p-2 rounded"
        />
      </div>
      <div className="flex gap-3 mb-6">
        <Button onClick={handleFilter}>Filtrar</Button>
        <Button variant="outline" onClick={handleClearFilters}>Limpar</Button>
      </div>

      {/* Modal de criação */}
      <LoanFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={fetchData}
      />

      {/* Modal de detalhes */}
      {viewingLoanId && (
        <LoanDetailsModal
          loanId={viewingLoanId}
          open={true}
          onClose={() => setViewingLoanId(null)}
        />
      )}

      {/* Lista de empréstimos */}
      <div className="space-y-2">
        {loans.map((loan: any) => (
          <Card key={loan.loan_id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">Cliente: {loan.client_name} (ID: {loan.client_id})</div>
                  <div>Valor: {formatCurrency(loan.amount_requested)}</div>
                  <div>Juros: {loan.interest_rate}%</div>
                  <div>Status: {loan.status}</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setViewingLoanId(loan.loan_id)}>
                    Ver detalhes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LoansPage;

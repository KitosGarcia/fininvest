import React, { useEffect, useState } from 'react';
import { Button } from '../../components/ui/button';
import { LoanFormModal } from './LoanFormModal';
import { LoanDetailsModal } from './LoanDetailsModal';
import loanService from '../../services/api/loanService';
import { Card, CardContent } from '../../components/ui/card';
import { formatCurrency } from '../../utils/formaters';

const LoansPage: React.FC = () => {
  const [loans, setLoans] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [viewingLoanId, setViewingLoanId] = useState<number | null>(null);

  const fetchData = async () => {
    const data = await loanService.getAll();
    setLoans(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Empréstimos</h1>
        <Button onClick={() => setShowForm(true)}>Novo Pedido</Button>
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
                  {/* Ações futuras:
                  <Button size="sm">Aprovar</Button>
                  <Button size="sm">Desembolsar</Button> */}
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
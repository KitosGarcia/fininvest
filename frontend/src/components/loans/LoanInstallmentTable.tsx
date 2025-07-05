import React, { useEffect, useState } from 'react';
import loanService from '../../services/api/loanService';
import { Card, CardContent } from '../../components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '../../components/ui/table';
import { format } from 'date-fns';
import { Loader } from 'lucide-react';
import { formatCurrency } from '../../utils/formaters';

interface Loan {
  loan_id: number;
  client_name: string;
  amount_requested: number;
  amount_approved: number;
  interest_rate: number;
  repayment_term_months: number;
  application_date: string;
  repayment_plan_type: 'único' | 'parcelado';
  loan_purpose?: string;
}

interface Installment {
  installment_id: number;
  due_date: string;
  amount: number;
  paid_amount: number;
  status: string;
}

interface LoanInstallmentTableProps {
  loan: Loan;
}

export const LoanInstallmentTable: React.FC<LoanInstallmentTableProps> = ({ loan }) => {
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!loan?.loan_id) return;
      setLoading(true);
      const data = await loanService.getInstallments(loan.loan_id);
      setInstallments(data);
      setLoading(false);
    };

    load();
  }, [loan]);

  if (!loan) return null;

  const showUniquePaymentInfo =
    !installments.length && loan.repayment_plan_type === 'único';

  const expectedRepaymentDate = loan.application_date
    ? format(
        new Date(
          new Date(loan.application_date).setMonth(
            new Date(loan.application_date).getMonth() + loan.repayment_term_months
          )
        ),
        'dd/MM/yyyy'
      )
    : '—';

  return (
    <Card className="mt-4">
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-2">Plano de Pagamento</h3>

        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader className="animate-spin mr-2" />
            A carregar...
          </div>
        ) : showUniquePaymentInfo ? (
          <div className="space-y-2">
            <p>Este empréstimo tem pagamento único.</p>
            <p><strong>Valor a Reembolsar:</strong> {formatCurrency(loan.amount_requested * (1 + loan.interest_rate / 100))}</p>
            <p><strong>Data Prevista de Reembolso:</strong> {expectedRepaymentDate}</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Pago</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {installments.map((inst, index) => (
                <TableRow key={inst.installment_id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{format(new Date(inst.due_date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{formatCurrency(inst.amount)}</TableCell>
                  <TableCell>{formatCurrency(inst.paid_amount)}</TableCell>
                  <TableCell>{inst.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

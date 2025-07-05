import React, { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import loanService from '../../services/api/loanService';
import { LoanInstallmentTable } from './LoanInstallmentTable';
import { format } from 'date-fns';
import { formatCurrency } from '../../utils/formaters';
import { generateLoanSimulationPdf } from '../../services/pdf/generateLoanSimulation';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';



interface LoanDetailsModalProps {
  loanId: number;
  open: boolean;
  onClose: () => void;
}

interface Loan {
  loan_id: number;
  client_id: number;
  client_name: string;
  amount_requested: number;
  interest_rate: number;
  repayment_term_months: number;
  loan_purpose: string;
  repayment_plan_type: string;
  application_date: string;
  approval_date: string | null;
  disbursement_date: string | null;
  status: string;
}

export const LoanDetailsModal: React.FC<LoanDetailsModalProps> = ({
  loanId,
  open,
  onClose
}) => {
  const [loan, setLoan] = useState<Loan | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const { user, hasPermission } = useAuth();
const canApprove = hasPermission('loan_approval', 'update');

  useEffect(() => {
    if (open && loanId) {
      loanService.getById(loanId).then(setLoan);
    }
  }, [open, loanId]);

const handleDecision = async (status: 'aprovado' | 'rejeitado') => {
  if (!user || !canApprove) return;
  try {
    await loanService.approveLoan(loan!.loan_id, user.user_id, status);
    toast.success(`Empréstimo ${status === 'aprovado' ? 'aprovado' : 'rejeitado'} com sucesso.`);

    // 🔁 Recarrega dados atualizados
    const updatedLoan = await loanService.getById(loan!.loan_id);
    setLoan(updatedLoan);

  } catch (err) {
    console.error(err);
    toast.error(`Erro ao ${status === 'aprovado' ? 'aprovar' : 'rejeitar'} empréstimo.`);
  }
};

  if (!loan || !user) return null;
console.log("Usuário logado:", user);
console.log("Permissão loan_approval/update:", canApprove);
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Empréstimo #{loan.loan_id}</DialogTitle>
        </DialogHeader>

        {/* Conteúdo visível e imprimível */}
        <div ref={printRef}>
          <div className="grid grid-cols-2 gap-4 mt-4 text-sm text-jarvis-text">
            <div><strong>Cliente:</strong> {loan.client_name} (<strong>ID:</strong> {loan.client_id})</div>
            <div><strong>Valor Solicitado:</strong> {formatCurrency(loan.amount_requested)}</div>
            <div><strong>Juros:</strong> {loan.interest_rate}%</div>
            <div><strong>Valor a Reembolsar:</strong> {formatCurrency(loan.amount_requested * (1 + loan.interest_rate / 100))}</div>
            <div><strong>Prazo:</strong> {loan.repayment_term_months} meses</div>
            <div><strong>Status:</strong> {loan.status}</div>
            <div><strong>Finalidade:</strong> {loan.loan_purpose || '—'}</div>
            <div><strong>Plano:</strong> {loan.repayment_plan_type || '—'}</div>
            <div><strong>Data Pedido:</strong> {loan.application_date ? format(new Date(loan.application_date), 'dd/MM/yyyy') : '—'}</div>
            <div><strong>Aprovado em:</strong> {loan.approval_date ? format(new Date(loan.approval_date), 'dd/MM/yyyy') : '—'}</div>
            <div><strong>Desembolsado em:</strong> {loan.disbursement_date ? format(new Date(loan.disbursement_date), 'dd/MM/yyyy') : '—'}</div>
          </div>
        </div>

        {/* Tabela de Prestações */}
        <LoanInstallmentTable loan={loan} />

      


        {/* Botões */}
        <div className="flex justify-end mt-6 gap-3">
        <Button variant="outline" onClick={onClose}>Fechar</Button>

          {canApprove && loan.status === 'pendente' && (
        
          <Button onClick={() => generateLoanSimulationPdf(loan.loan_id)}>
            Gerar PDF da Simulação
          </Button>)}

         {canApprove && loan.status === 'pendente' && (
  <>
    <Button onClick={() => handleDecision('aprovado')}>
      Aprovar
    </Button>
    <Button
      variant="destructive"
      onClick={() => handleDecision('rejeitado')}
    >
      Rejeitar
    </Button>
  </>
)}
        </div>
      </DialogContent>
    </Dialog>
  );
};

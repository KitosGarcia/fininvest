import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import toast from 'react-hot-toast';
import loanService from '../../services/api/loanService';

interface LoanApproveModalProps {
  open: boolean;
  onClose: () => void;
  loanId: number;
  onSuccess: () => void;
}

export const LoanApproveModal: React.FC<LoanApproveModalProps> = ({
  open,
  onClose,
  loanId,
  onSuccess
}) => {
  const handleApprove = async () => {
    try {
      await loanService.approve(loanId, {
        approval_date: new Date(),
        approved_by_user_id: 1 // substituir por user_id real autenticado
      });
      toast.success('Empréstimo aprovado com sucesso!');
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao aprovar empréstimo.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Aprovar Empréstimo</DialogTitle>
        </DialogHeader>

        <p>Deseja realmente aprovar este pedido de empréstimo?</p>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleApprove}>Aprovar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

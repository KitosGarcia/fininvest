import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../components/ui/select';
import toast from 'react-hot-toast';
import loanService from '../../services/api/loanService';
import { bankAccountService } from '../../services/api/bankAccountService';

interface LoanDisburseModalProps {
  open: boolean;
  onClose: () => void;
  loanId: number;
  onSuccess: () => void;
}

export const LoanDisburseModal: React.FC<LoanDisburseModalProps> = ({
  open,
  onClose,
  loanId,
  onSuccess
}) => {
  const [accounts, setAccounts] = useState([]);
  const [disbursementDate, setDisbursementDate] = useState('');
  const [disbursementAccount, setDisbursementAccount] = useState('');

 useEffect(() => {
  bankAccountService.getAll().then(setAccounts);
}, []);

  const handleDisburse = async () => {
    if (!disbursementDate || !disbursementAccount) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }

    try {
      await loanService.disburse(loanId, {
        disbursement_date: disbursementDate,
        disbursement_account: parseInt(disbursementAccount)
      });

      toast.success('Desembolso registado com sucesso!');
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao registar desembolso.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registar Desembolso</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Data do Desembolso</Label>
            <Input
              type="date"
              value={disbursementDate}
              onChange={(e) => setDisbursementDate(e.target.value)}
            />
          </div>

          <div>
            <Label>Conta de Origem</Label>
            <Select onValueChange={setDisbursementAccount}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma conta bancária" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((acc: any) => (
                  <SelectItem key={acc.account_id} value={String(acc.account_id)}>
                    {acc.account_name} - {acc.bank_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleDisburse}>Confirmar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

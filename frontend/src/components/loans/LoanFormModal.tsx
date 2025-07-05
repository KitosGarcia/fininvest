import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../components/ui/select';
import toast from 'react-hot-toast';
import clientService from '../../services/api/clientService';
import loanService from '../../services/api/loanService';

interface LoanFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const LoanFormModal: React.FC<LoanFormModalProps> = ({
  open,
  onClose,
  onSuccess
}) => {
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({
    client_id: '',
    amount_requested: '',
    interest_rate: '',
    repayment_term_months: '',
    loan_purpose: '',
    repayment_plan_type: 'parcelado'
  });

  useEffect(() => {
    clientService.getAll().then(setClients);
  }, []);

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const {
      client_id,
      amount_requested,
      interest_rate,
      repayment_term_months,
      loan_purpose,
      repayment_plan_type
    } = form;

    // Validação simples
    if (!client_id || !amount_requested || !interest_rate || !repayment_term_months) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const payload = {
        client_id: parseInt(client_id),
        amount_requested: parseFloat(amount_requested),
        interest_rate: parseFloat(interest_rate),
        repayment_term_months: parseInt(repayment_term_months),
        loan_purpose,
        repayment_plan_type,
        created_by_user_id: 1 // TODO: substituir pelo ID do utilizador autenticado
      };

      await loanService.create(payload);
      toast.success('Empréstimo criado com sucesso!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao criar empréstimo.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Novo Pedido de Empréstimo</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label>Cliente</Label>
            <Select onValueChange={(val) => handleChange('client_id', val)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c: any) => (
                  <SelectItem key={c.client_id} value={String(c.client_id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Valor Solicitado</Label>
            <Input
              type="number"
              value={form.amount_requested}
              onChange={(e) => handleChange('amount_requested', e.target.value)}
            />
          </div>

          <div>
            <Label>Taxa de Juros (%)</Label>
            <Input
              type="number"
              value={form.interest_rate}
              onChange={(e) => handleChange('interest_rate', e.target.value)}
            />
          </div>

          <div>
            <Label>Prazo (meses)</Label>
            <Input
              type="number"
              value={form.repayment_term_months}
              onChange={(e) => handleChange('repayment_term_months', e.target.value)}
            />
          </div>

          <div>
            <Label>Finalidade</Label>
            <Input
              value={form.loan_purpose}
              onChange={(e) => handleChange('loan_purpose', e.target.value)}
            />
          </div>

          <div>
            <Label>Plano de Pagamento</Label>
            <Select
              value={form.repayment_plan_type}
              onValueChange={(val) => handleChange('repayment_plan_type', val)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="único">Pagamento Único</SelectItem>
                <SelectItem value="parcelado">Parcelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleSubmit}>Criar Pedido</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

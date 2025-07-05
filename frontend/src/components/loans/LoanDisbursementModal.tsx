import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { uploadFile } from '../../services/uploadService';
import loanService from '../../services/api/loanService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Loader2 } from 'lucide-react';

export default function LoanDisbursementModal({ open, onClose, loan, bankAccounts, currentUser }) {
  const { register, handleSubmit, setValue, reset } = useForm();
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const approvedAmount = Number(loan?.amount_approved || 0);

  useEffect(() => {
    if (open) {
      reset();              // Limpa o formulário ao abrir
      setFileUrl('');
      setSelectedDate(null);
    }
  }, [open, reset]);

  const onSubmit = async (data) => {
    const amountEntered = parseFloat(data.amount_disbursed);
    const bankAccountId = data.bank_account_id;

    if (!selectedDate) {
      toast.error('Por favor selecione a data do desembolso.');
      return;
    }

    if (!bankAccountId) {
      toast.error('Por favor selecione uma conta bancária.');
      return;
    }

    if (amountEntered !== approvedAmount) {
      toast.error(`O valor do desembolso deve ser exatamente igual ao valor aprovado (${approvedAmount.toFixed(2)} EUR).`);
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        disbursement_date: selectedDate.toISOString().split('T')[0],
        amount_disbursed: amountEntered,
        bank_account_id: Number(bankAccountId),
        signed_contract_url: fileUrl || null,
        user_id: currentUser?.user_id,
      };

      await loanService.disburse(loan.loan_id, payload);
      toast.success('Empréstimo desembolsado com sucesso');
      toast.success(`Resumo: ${loan.client_name} recebeu ${approvedAmount.toFixed(2)} EUR em ${selectedDate.toLocaleDateString()}`);
      onClose();
      reset();
      setSelectedDate(null);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao desembolsar empréstimo');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file);
      setFileUrl(url);
      toast.success('Contrato enviado');
    } catch (err) {
      toast.error('Erro ao fazer upload do contrato');
    } finally {
      setUploading(false);
    }
  };

  console.log("🏦 bankAccounts:", bankAccounts);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Desembolsar Empréstimo</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Data do Desembolso</Label>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => {
                setSelectedDate(date);
                setValue('disbursement_date', date);
              }}
              className="w-full border rounded px-3 py-2"
              dateFormat="yyyy-MM-dd"
              placeholderText="Selecione a data"
            />
          </div>

          <div>
            <Label>Valor Desembolsado</Label>
            <Input
              type="number"
              step="0.01"
              {...register('amount_disbursed', { required: true })}
            />
            <p className="text-sm text-gray-400 mt-1">
              Valor aprovado: {approvedAmount.toFixed(2)} EUR
            </p>
          </div>

          <div>
            <Label>Banco de Origem</Label>
            <Select onValueChange={(val) => setValue('bank_account_id', val)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um banco" />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(bankAccounts) && bankAccounts
                  .filter((account) =>
                    account &&
                    account.account_id &&
                    account.bank_name &&
                    account.account_name
                  )
                  .map((account) => (
                    <SelectItem key={account.account_id} value={account.account_id.toString()}>
                      {account.bank_name} - {account.account_name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Contrato Assinado (PDF)</Label>
            <Input type="file" accept="application/pdf" onChange={handleFileChange} />
            {uploading && <p className="text-sm text-gray-400">Enviando contrato...</p>}
            {fileUrl && <p className="text-green-500 text-sm">Contrato enviado com sucesso.</p>}
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={uploading || submitting}>
              {submitting && <Loader2 className="animate-spin w-4 h-4 mr-2" />}
              Confirmar Desembolso
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

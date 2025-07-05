import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { toast } from 'react-hot-toast';
import axios from 'axios';

interface Member {
  member_id: number;
  name: string;
}

interface TierFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editData?: any;
}

const TierFormModal: React.FC<TierFormModalProps> = ({ isOpen, onClose, onSave, editData }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [form, setForm] = useState({
    member_id: '',
    quota_amount: '',
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    if (editData) {
      setForm({
        member_id: editData.member_id,
        quota_amount: editData.quota_amount,
        start_date: editData.start_date.split('T')[0],
        end_date: editData.end_date.split('T')[0],
      });
    } else {
      setForm({
        member_id: '',
        quota_amount: '',
        start_date: '',
        end_date: ''
      });
    }
  }, [editData]);

  useEffect(() => {
    axios.get('/api/members').then(res => {
      setMembers(res.data);
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const handleSubmit = async () => {
  if (!form.quota_amount || parseFloat(form.quota_amount) <= 0) {
    toast.error("O valor da quota deve ser maior que zero.");
    return;
  }

  try {
    if (editData) {
      await axios.put(`/api/tiers/${editData.tier_id}`, form);
      toast.success('Escalão atualizado com sucesso.');
    } else {
      await axios.post('/api/tiers', form);
      toast.success('Escalão criado com sucesso.');
    }
    onSave();
    onClose();
  } catch (err: any) {
    toast.error(err?.response?.data?.message || 'Erro ao salvar escalão.');
  }
};

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editData ? 'Editar Escalão de Quota' : 'Novo Escalão de Quota'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Sócio</Label>
            <select
              name="member_id"
              value={form.member_id}
              onChange={handleChange}
              className="w-full border rounded p-2 bg-jarvis.panel text-jarvis.text"
              disabled={!!editData}
            >
              <option value="">Selecione...</option>
              {members.map((m) => (
                <option key={m.member_id} value={m.member_id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Valor da Quota</Label>
            <Input
              type="number"
              name="quota_amount"
              value={form.quota_amount}
              onChange={handleChange}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <Label>Início</Label>
              <Input
                type="date"
                name="start_date"
                value={form.start_date}
                onChange={handleChange}
              />
            </div>
            <div className="flex-1">
              <Label>Fim</Label>
              <Input
                type="date"
                name="end_date"
                value={form.end_date}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleSubmit}>{editData ? 'Atualizar' : 'Salvar'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TierFormModal;

// src/components/members/MemberFormModal.tsx
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { memberService } from "../../services/api/memberService";
import { toast } from "react-hot-toast";

interface MemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: "create" | "edit";
  initialData?: any;
}

export default function MemberFormModal({
  isOpen,
  onClose,
  onSuccess,
  mode,
  initialData,
}: MemberFormModalProps) {
  const isEdit = mode === "edit";

  const blank = {
    name: "",
    document_id: "",
    join_date: "",
    status: "active",
    email: "",
    phone: "",
    address: "",
    birth_date: "",
    gender: "",
    nationality: "",
    marital_status: "",
    occupation: "",
    income_range: "",
    pep_flag: false,
  };

  const [form, setForm] = useState(blank);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setForm(isEdit && initialData ? { ...blank, ...initialData } : blank);
  }, [isOpen, isEdit, initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await memberService.update(initialData.member_id, form);
        toast.success("Sócio atualizado com sucesso!");
      } else {
        await memberService.create(form);
        toast.success("Sócio criado com sucesso!");
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Erro ao gravar membro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-blue-950 text-blue-100 max-w-2xl border border-blue-800 overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Sócio" : "Novo Sócio"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* LINHA 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nome</Label>
              <Input name="name" value={form.name} onChange={handleChange} required className="bg-blue-900 border-blue-700" />
            </div>
            <div>
              <Label>Documento</Label>
              <Input name="document_id" value={form.document_id} onChange={handleChange} required className="bg-blue-900 border-blue-700" />
            </div>
          </div>

          {/* LINHA 2 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Email</Label>
              <Input name="email" value={form.email} onChange={handleChange} className="bg-blue-900 border-blue-700" />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input name="phone" value={form.phone} onChange={handleChange} className="bg-blue-900 border-blue-700" />
            </div>
            <div>
              <Label>Data Entrada</Label>
              <Input type="date" name="join_date" value={form.join_date} onChange={handleChange} className="bg-blue-900 border-blue-700" />
            </div>
          </div>

          {/* LINHA 3 */}
          <div>
            <Label>Morada</Label>
            <Input name="address" value={form.address} onChange={handleChange} className="bg-blue-900 border-blue-700" />
          </div>

          {/* LINHA 4 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Data Nasc.</Label>
              <Input type="date" name="birth_date" value={form.birth_date} onChange={handleChange} className="bg-blue-900 border-blue-700" />
            </div>
            <div>
              <Label>Género</Label>
              <select name="gender" value={form.gender} onChange={handleChange} className="w-full px-3 py-2 rounded bg-blue-900 border border-blue-700">
                <option value="">—</option>
                <option value="male">Masculino</option>
                <option value="female">Feminino</option>
                <option value="other">Outro</option>
              </select>
            </div>
            <div>
              <Label>Nacionalidade</Label>
              <Input name="nationality" value={form.nationality} onChange={handleChange} className="bg-blue-900 border-blue-700" />
            </div>
            <div>
              <Label>Estado civil</Label>
              <Input name="marital_status" value={form.marital_status} onChange={handleChange} className="bg-blue-900 border-blue-700" />
            </div>
          </div>

          {/* LINHA 5 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Profissão</Label>
              <Input name="occupation" value={form.occupation} onChange={handleChange} className="bg-blue-900 border-blue-700" />
            </div>
            <div>
              <Label>Rendimento</Label>
              <Input name="income_range" value={form.income_range} onChange={handleChange} className="bg-blue-900 border-blue-700" />
            </div>
            <div className="flex items-center gap-2 mt-7">
              <input type="checkbox" name="pep_flag" checked={form.pep_flag} onChange={handleChange} className="accent-green-500" />
              <Label>PEP</Label>
            </div>
          </div>

          {/* BOTÕES */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : isEdit ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

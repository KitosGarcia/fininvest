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
import { clientService } from "../../services/api/clientService";

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: "create" | "edit";
  initialData?: any;
}

export default function ClientFormModal({
  isOpen,
  onClose,
  onSuccess,
  mode,
  initialData,
}: ClientFormModalProps) {
  const isEdit = mode === "edit";

  const blank = {
    member_id: "",
    name: "",
    document_id: "",
    email: "",
    phone: "",
    address: "",
    client_type: "internal",
    birth_date: "",
    gender: "",
    nationality: "",
    marital_status: "",
    occupation: "",
    income_range: "",
    pep_flag: false,
    status: "ativo",
    documents: "",
    risk_profile: "",
    credit_rating: "",

  };

  const [form, setForm] = useState(blank);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (isEdit && initialData) {
      const safeData = Object.fromEntries(
        Object.entries({ ...blank, ...initialData }).map(([k, v]) => [
          k,
          v ?? (typeof blank[k as keyof typeof blank] === "boolean" ? false : ""),
        ])
      );
      setForm(safeData);
    } else {
      setForm(blank);
    }
  }, [isOpen, isEdit, initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value ?? "",
    }));
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  try {
const payload = Object.fromEntries(
  Object.entries({
    ...form,
    pep_flag: !!form.pep_flag,
    status: form.status || "ativo",
    client_type: form.client_type || "internal",
  }).filter(([_, v]) => v !== "")
);


    console.log("Submitting payload:", payload);

    if (!payload.name || !payload.document_id) {
      alert("Nome e Documento são obrigatórios.");
      return;
    }

    if (isEdit) {
      await clientService.update(initialData.client_id, payload);
    } else {
      await clientService.create(payload);
    }

    onSuccess();
    onClose();
  } catch (err: any) {
    alert(err?.response?.data?.message || "Erro ao gravar cliente");
  } finally {
    setLoading(false);
  }
};


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        aria-describedby="client-form-description"
        className="bg-blue-950 text-blue-100 max-w-2xl border border-blue-800 overflow-y-auto max-h-[90vh]"
      >
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
          <p id="client-form-description" className="sr-only">
            Formulário para criação ou edição de cliente.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* LINHA 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nome</Label>
              <Input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="bg-blue-900 border-blue-700"
              />
            </div>
            <div>
              <Label>NIF / Doc. Ident.</Label>
              <Input
                name="document_id"
                value={form.document_id}
                onChange={handleChange}
                required
                className="bg-blue-900 border-blue-700"
              />
            </div>
          </div>

          {/* LINHA 2 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>E-mail</Label>
              <Input
                name="email"
                value={form.email}
                onChange={handleChange}
                className="bg-blue-900 border-blue-700"
              />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="bg-blue-900 border-blue-700"
              />
            </div>
            <div>
              <Label>Tipo</Label>
              <select
                name="client_type"
                value={form.client_type}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded bg-blue-900 border border-blue-700"
              >
                <option value="internal">Interno</option>
                <option value="external">Externo</option>
              </select>
            </div>
          </div>

          {/* LINHA 3 */}
          <div>
            <Label>Morada</Label>
            <Input
              name="address"
              value={form.address}
              onChange={handleChange}
              className="bg-blue-900 border-blue-700"
            />
          </div>

          {/* LINHA 4 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Data Nasc.</Label>
              <Input
                type="date"
                name="birth_date"
                value={form.birth_date}
                onChange={handleChange}
                className="bg-blue-900 border-blue-700"
              />
            </div>
            <div>
              <Label>Género</Label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded bg-blue-900 border border-blue-700"
              >
                <option value="">—</option>
                <option value="male">Masculino</option>
                <option value="female">Feminino</option>
                <option value="other">Outro</option>
              </select>
            </div>
            <div>
              <Label>Nacionalidade</Label>
              <Input
                name="nationality"
                value={form.nationality}
                onChange={handleChange}
                className="bg-blue-900 border-blue-700"
              />
            </div>
            <div>
              <Label>Estado civil</Label>
              <Input
                name="marital_status"
                value={form.marital_status}
                onChange={handleChange}
                className="bg-blue-900 border-blue-700"
              />
            </div>
          </div>

          {/* LINHA 5 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Profissão</Label>
              <Input
                name="occupation"
                value={form.occupation}
                onChange={handleChange}
                className="bg-blue-900 border-blue-700"
              />
            </div>
            <div>
              <Label>Rendimento</Label>
              <Input
                name="income_range"
                value={form.income_range}
                onChange={handleChange}
                className="bg-blue-900 border-blue-700"
              />
            </div>
            <div className="flex items-center gap-2 mt-7">
              <input
                type="checkbox"
                name="pep_flag"
                checked={form.pep_flag}
                onChange={handleChange}
                className="accent-green-500"
              />
              <Label>PEP</Label>
            </div>
          </div>

          {/* BOTÕES */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : isEdit ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

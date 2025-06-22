import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { userService } from "../../services/api/userService";

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  mode: "create" | "edit";
  initialData?: any;
}

export function UserFormModal({ isOpen, onClose, onSubmit, mode, initialData }: UserFormModalProps) {
  const [formData, setFormData] = useState({
    member_id: "",
    username: "",
    password: "",
    role_id: "",
    two_factor_enabled: false,
  });

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const isEdit = mode === "edit";

  useEffect(() => {
    userService.getRoles().then(setRoles).catch(console.error);
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (isEdit && initialData) {
        setFormData({
          member_id: initialData.member_id || "",
          username: initialData.username || "",
          password: "",
          role_id: initialData.role_id || "",
          two_factor_enabled: initialData.two_factor_enabled || false,
        });
      } else {
        // Resetar quando for novo utilizador
        setFormData({
          member_id: "",
          username: "",
          password: "",
          role_id: "",
          two_factor_enabled: false,
        });
      }
      setErrorMessage(""); // limpa erro quando abre
    }
  }, [isOpen, isEdit, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      if (isEdit) {
        await userService.update(initialData.user_id, formData);
      } else {
        await userService.create(formData);
      }
      onSubmit();
      onClose();
    } catch (error: any) {
      console.error("Erro ao guardar utilizador:", error);
      if (error.response?.status === 409) {
        setErrorMessage("Já existe um utilizador com este username.");
      } else {
        setErrorMessage("Ocorreu um erro ao criar/editar o utilizador.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-blue-950 text-blue-100 max-w-lg border border-blue-800">
        <DialogHeader>
          <DialogTitle className="text-blue-100">
            {isEdit ? "Editar Utilizador" : "Novo Utilizador"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4" autoComplete="off">
          <div className="space-y-1">
            <Label className="text-blue-200">Username</Label>
            <Input
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              autoComplete="off"
              className="bg-blue-900 border-blue-700 text-white"
            />
          </div>

          {!isEdit && (
            <div className="space-y-1">
              <Label className="text-blue-200">Password</Label>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                className="bg-blue-900 border-blue-700 text-white"
              />
            </div>
          )}

          <div className="space-y-1">
            <Label className="text-blue-200">Member ID (opcional)</Label>
            <Input
              name="member_id"
              value={formData.member_id}
              onChange={handleChange}
              className="bg-blue-900 border-blue-700 text-white"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-blue-200">Perfil (Role)</Label>
            <select
              name="role_id"
              value={formData.role_id}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-blue-900 border border-blue-700 text-white"
              required
            >
              <option value="">Selecione...</option>
              {roles.map((role: any) => (
                <option key={role.role_id} value={role.role_id}>
                  {role.role_name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="two_factor_enabled"
              checked={formData.two_factor_enabled}
              onChange={handleChange}
              className="accent-green-500"
            />
            <Label className="text-blue-200">Ativar 2FA</Label>
          </div>

          {errorMessage && (
            <div className="text-red-400 text-sm bg-red-900 border border-red-800 rounded p-2">
              {errorMessage}
            </div>
          )}

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

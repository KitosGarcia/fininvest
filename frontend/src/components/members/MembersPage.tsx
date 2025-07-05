import { useEffect, useState } from "react";
import { memberService } from "../../services/api/memberService";
import MemberFormModal from "./MemberFormModal";
import MemberViewModal from "./MemberViewModal";
import { clientService } from "../../services/api/clientService";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface Member {
  member_id: number;
  name: string;
  document_id: string;
  join_date?: string;
  status: string;
  email?: string;
  phone?: string;
  address?: string;
  birth_date?: string;
  gender?: string;
  nationality?: string;
  marital_status?: string;
  occupation?: string;
  income_range?: string;
  pep_flag?: boolean;
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewMember, setViewMember] = useState<Member | null>(null);

  const [filters, setFilters] = useState({
    name: "",
    document_id: "",
    email: "",
    phone: "",
    status: ""
  });

  const loadMembers = async () => {
    try {
      const data = await memberService.getAll();
      setMembers(data);
    } catch (err) {
      console.error("Erro ao buscar sócios:", err);
    }
  };

  useEffect(() => { loadMembers(); }, []);

  const openNewMember = () => {
    setFormMode("create");
    setSelectedMember(null);
    setModalOpen(true);
  };

  const openEditMember = async (member: Member) => {
    const client = await clientService.getByMemberId(member.member_id);
    setFormMode("edit");
    setSelectedMember({ ...member, ...client });
    setModalOpen(true);
  };

  const openViewMember = async (member: Member) => {
    const client = await clientService.getByMemberId(member.member_id);
    setViewMember({ ...member, ...client });
    setViewModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedMember(null);
  };

  const updateFilter = (field: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const clearAllFilters = () => {
    setFilters({ name: "", document_id: "", email: "", phone: "", status: "" });
  };

  const filteredMembers = members.filter((m) => {
    return (
      m.name.toLowerCase().includes(filters.name.toLowerCase()) &&
      m.document_id.toLowerCase().includes(filters.document_id.toLowerCase()) &&
      (m.email || "").toLowerCase().includes(filters.email.toLowerCase()) &&
      (m.phone || "").includes(filters.phone) &&
      m.status.toLowerCase().includes(filters.status.toLowerCase())
    );
  });

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-jarvis.text">Sócios</h2>
        <div className="flex items-center gap-4">
          <Button onClick={openNewMember}>Novo Sócio</Button>
          {Object.values(filters).some(v => v !== "") && (
            <Button variant="ghost" onClick={clearAllFilters}>Limpar filtros ✕</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {Object.keys(filters).map((field) => (
          <Input
            key={field}
            name={field}
            placeholder={`Filtrar por ${field}`}
            value={filters[field as keyof typeof filters]}
            onChange={(e) => updateFilter(field as keyof typeof filters, e.target.value)}
          />
        ))}
      </div>

      <table className="w-full text-sm text-left mt-4">
        <thead className="border-b border-jarvis.panel">
          <tr>
            <th className="p-2">Nome</th>
            <th className="p-2">Doc.ID</th>
            <th className="p-2">Email</th>
            <th className="p-2">Telefone</th>
            <th className="p-2">Estado</th>
            <th className="p-2 text-center">Ações</th>
          </tr>
        </thead>
        <tbody>
          {filteredMembers.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-4 text-center text-jarvis.text">Nenhum sócio encontrado.</td>
            </tr>
          ) : (
            filteredMembers.map((m) => (
              <tr key={m.member_id} className="border-b border-jarvis.panel hover:bg-jarvis.bg/30">
                <td className="p-2">{m.name}</td>
                <td className="p-2">{m.document_id}</td>
                <td className="p-2">{m.email || "—"}</td>
                <td className="p-2">{m.phone || "—"}</td>
                <td className="p-2">{m.status}</td>
                <td className="p-2 text-center space-x-2">
                  <Button size="sm" variant="ghost" onClick={() => openEditMember(m)}>Editar</Button>
                  <Button size="sm" variant="ghost" onClick={() => openViewMember(m)}>👁 Ver</Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <MemberFormModal
        key={modalOpen ? `${formMode}-${selectedMember?.member_id ?? "new"}` : "closed"}
        isOpen={modalOpen}
        onClose={closeModal}
        onSuccess={loadMembers}
        mode={formMode}
        initialData={selectedMember}
      />

      {viewModalOpen && viewMember && (
        <MemberViewModal
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          member={viewMember}
        />
      )}
    </div>
  );
}

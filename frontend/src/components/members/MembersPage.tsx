// src/components/members/MembersPage.tsx
import { useEffect, useState } from "react";
import { memberService } from "../../services/api/memberService";
import MemberFormModal from "./MemberFormModal";
import MemberViewModal from "./MemberViewModal";
import { clientService } from "../../services/api/clientService";

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
    <div className="text-white p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Sócios</h2>
        <div className="flex items-center space-x-4">
          <button onClick={openNewMember} className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded">
            Novo Sócio
          </button>
          {Object.values(filters).some(v => v !== "") && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-red-400 hover:text-red-600"
            >
              Limpar filtros ✕
            </button>
          )}
        </div>
      </div>

      <table className="w-full text-sm border border-blue-800 bg-blue-950 rounded shadow">
        <thead className="bg-blue-900">
          <tr>
            <th className="p-2 text-left">Nome</th>
            <th className="p-2 text-left">Doc.ID</th>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Telefone</th>
            <th className="p-2 text-center">Estado</th>
            <th className="p-2 text-center">Ações</th>
          </tr>
          <tr className="bg-blue-950">
            {["name", "document_id", "email", "phone", "status"].map((field) => (
              <th key={field} className="p-1">
                <div className="flex items-center">
                  <input
                    type="text"
                    placeholder="Filtrar"
                    value={filters[field as keyof typeof filters]}
                    onChange={(e) => updateFilter(field as keyof typeof filters, e.target.value)}
                    className="w-full text-xs bg-blue-800 text-white p-1 rounded"
                  />
                  {filters[field as keyof typeof filters] && (
                    <button
                      onClick={() => updateFilter(field as keyof typeof filters, "")}
                      className="ml-1 text-red-400 hover:text-red-600 text-sm"
                      title="Limpar filtro"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </th>
            ))}
            <th></th>
          </tr>
        </thead>

        <tbody>
          {filteredMembers.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-4 text-center text-blue-300">
                Nenhum sócio encontrado.
              </td>
            </tr>
          ) : (
            filteredMembers.map((m) => (
              <tr key={m.member_id} className="border-t border-blue-800">
                <td className="p-2">{m.name}</td>
                <td className="p-2">{m.document_id}</td>
                <td className="p-2">{m.email || "—"}</td>
                <td className="p-2">{m.phone || "—"}</td>
                <td className="p-2 text-center">{m.status}</td>
                <td className="p-2 text-center space-x-2">
                  <button onClick={() => openEditMember(m)} className="text-blue-400 hover:text-blue-600">
                    Editar
                  </button>
                  <button onClick={() => openViewMember(m)} className="text-blue-400 hover:text-blue-600">
                    👁 Ver
                  </button>
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

// src/services/api/memberService.ts
import api from "../../services/api";

export interface MemberInput {
  name: string;
  document_id: string;
  join_date?: string; // yyyy-mm-dd
  status?: "active" | "inactive" | "pending_adhesion";
  email?: string;
  phone?: string;
  address?: string;
  birth_date?: string;
  gender?: "male" | "female" | "other" | "";
  nationality?: string;
  marital_status?: string;
  occupation?: string;
  income_range?: string;
  pep_flag?: boolean;
}

export interface Member extends MemberInput {
  member_id: number;
  default_quota_amount?: string;
  adhesion_term_url?: string;
  created_at: string;
  updated_at: string;
}

/* ---------- CRUD ---------- */

export const memberService = {
  /* LISTA COMPLETA */
  getAll: async (): Promise<Member[]> => {
    const res = await api.get("/members");
    return res.data;
  },

  /* UM MEMBRO */
  getById: async (id: number): Promise<Member> => {
    const res = await api.get(`/members/${id}`);
    return res.data;
  },

  /* NOVO */
  create: async (data: MemberInput): Promise<Member> => {
    const res = await api.post("/members", data);
    return res.data;
  },

  /* EDITAR */
  update: async (id: number, updates: Partial<MemberInput>): Promise<Member> => {
    const res = await api.put(`/members/${id}`, updates);
    return res.data;
  },

  /* DESATIVAR (soft delete) */
  delete: async (id: number): Promise<{ message: string }> => {
    const res = await api.delete(`/members/${id}`);
    return res.data;
  },
};

export default memberService;

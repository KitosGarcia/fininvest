// src/services/api/clientService.ts
import api from "../../services/api";        

export interface ClientInput {
  member_id?: number | null;      // se “interno”
  name: string;
  document_id: string;            // NIF / BI …
  email?: string;
  phone?: string;
  address?: string;
  client_type: "internal" | "external";
  birth_date?: string;            // yyyy-mm-dd
  gender?: "male" | "female" | "other" | "";
  nationality?: string;
  marital_status?: string;
  occupation?: string;
  income_range?: string;
  pep_flag?: boolean;
  risk_profile?: string;
  credit_rating?: string;
  status?: "ativo" | "inativo" | "suspenso";
}

export interface Client extends ClientInput {
  client_id: number;
  created_at: string;
  updated_at: string;
}

/* ---------- CRUD ---------- */

export const clientService = {
  /* LISTA COMPLETA */
  getAll: async (): Promise<Client[]> => {
    const res = await api.get("/clients");
    return res.data;
  },

  /* UM CLIENTE */
  getById: async (id: number): Promise<Client> => {
    const res = await api.get(`/clients/${id}`);
    return res.data;
  },

  /* NOVO */
  create: async (data: ClientInput): Promise<Client> => {
    const res = await api.post("/clients", data);
    return res.data;
  },

  /* EDITAR */
  update: async (id: number, updates: Partial<ClientInput>): Promise<Client> => {
    const res = await api.put(`/clients/${id}`, updates);
    return res.data;
  },

  /* (Opcional) REMOVER — soft delete recomendado */
  delete: async (id: number): Promise<{ message: string }> => {
    const res = await api.delete(`/clients/${id}`);
    return res.data;
  },
};

export default clientService;

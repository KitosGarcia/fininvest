// src/types/client.ts
export interface Client {
  client_id: number;
  member_id?: number | null;
  name: string;
  document_id: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  client_type: "internal" | "external";
  birth_date?: string | null; // ISO format e.g., "1994-03-29"
  gender?: string | null;
  nationality?: string | null;
  marital_status?: string | null;
  occupation?: string | null;
  income_range?: string | null;
  pep_flag?: boolean;
  risk_profile?: string | null;
  credit_rating?: string | null;
  documents?: string | null;
  status: "ativo" | "inativo";
  created_at?: string;
  updated_at?: string;
}


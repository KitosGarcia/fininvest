import api from "../api";

export interface ContributionInput {
  member_id: number;
  type: "quota" | "taxa";
  reference_month: string; // formato yyyy-mm
  amount_due: number;
  due_date: string; // formato yyyy-mm-dd
}

export interface Contribution extends ContributionInput {
  contribution_id: number;
  amount_paid: number;
  status: "por_pagar" | "parcial" | "pago" | "cancelado";
  created_at: string;
  updated_at: string;
}

export const contributionService = {
  
  // Buscar todas as contribuições
  getAll: async (): Promise<Contribution[]> => {
    const res = await api.get("/contributions");
    return res.data;
  },

  // Buscar contribuição específica
  getById: async (id: number): Promise<Contribution> => {
    const res = await api.get(`/contributions/${id}`);
    return res.data;
  },

  // Criar nova contribuição
  create: async (data: ContributionInput): Promise<Contribution> => {
    const res = await api.post("/contributions", data);
    return res.data.contribution;
  },

  // Atualizar contribuição (detalhes, não pagamento)
  update: async (id: number, updates: Partial<ContributionInput>): Promise<Contribution> => {
    const res = await api.put(`/contributions/${id}`, updates);
    return res.data.contribution;
  },

  // Confirmação de pagamento (caso use um endpoint separado)
  confirmPayment: async (
    id: number,
    data: {
      amount_paid: number;
      payment_date: string;
      bank_account_id: number;
      payment_method?: string;
      payment_proof_url?: string;
      notes?: string;
    }
  ): Promise<Contribution> => {
    const res = await api.put(`/contributions/${id}/confirm`, data);
    return res.data.contribution;
  },

  // Remover contribuição
  delete: async (id: number): Promise<{ message: string }> => {
    const res = await api.delete(`/contributions/${id}`);
    return res.data;
  },
};

export default contributionService;

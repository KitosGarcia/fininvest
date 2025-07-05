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

  export const getContributionStatus = async (memberId: number) => {
  const res = await api.get(`/contributions/status/${memberId}`);
  return res.data;
}

export const contributionService = {
  // Buscar todas as contribuições
  getAll: async (): Promise<Contribution[]> => {
    const res = await api.get("/contributions");
    return res.data;
  },

  getById: async (id: number): Promise<Contribution> => {
    const res = await api.get(`/contributions/${id}`);
    return res.data;
  },

  create: async (data: ContributionInput): Promise<Contribution> => {
    const res = await api.post("/contributions", data);
    return res.data.contribution;
  },

  update: async (id: number, updates: Partial<ContributionInput>): Promise<Contribution> => {
    const res = await api.put(`/contributions/${id}`, updates);
    return res.data.contribution;
  },

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

  delete: async (id: number): Promise<{ message: string }> => {
    const res = await api.delete(`/contributions/${id}`);
    return res.data;
  },

  getStatus: async (memberId: number) => {
    const res = await api.get(`/contributions/status/${memberId}`);
    return res.data;
  },

  generateBulk: async (data: { year: number; tax_amount: number }) => {
    const response = await api.post("/contributions/generate-bulk", data);
    return response.data;
  },
};

export default contributionService;
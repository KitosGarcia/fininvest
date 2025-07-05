// src/services/api/loanService.ts
import api from "../../services/api";

export interface LoanInput {
  client_id: number;
  amount_requested: number;
  interest_rate: number;
  repayment_term_months: number;
  loan_purpose: string;
  repayment_plan_type: "único" | "parcelado";
  created_by_user_id: number;
}

export interface Loan {
  loan_id: number;
  client_id: number;
  amount_requested: number;
  amount_approved: number;
  interest_rate: number;
  loan_purpose: string;
  repayment_term_months: number;
  status: string;
  application_date: string;
  approval_date?: string;
  disbursement_date?: string;
  repayment_plan_type: string;
  // outros campos se precisares
}

export interface Installment {
  installment_id: number;
  loan_id: number;
  due_date: string;
  amount: number;
  paid_amount: number;
  status: string;
}

/* ---------- Serviço completo ---------- */

export const loanService = {
  getAll: async (): Promise<Loan[]> => {
    const res = await api.get('/loans');
    return res.data;
  },

  create: async (data: LoanInput): Promise<{ loan_id: number }> => {
    const res = await api.post('/loans', data);
    return res.data;
  },

  approveLoan: (loanId: number, userId: number, status: 'aprovado' | 'rejeitado') =>
    api.put(`/loans/${loanId}/approve`, {
      approved_by_user_id: userId,
      status,
    }),


  disburse: async (loanId: number, payload: { disbursement_date: string; disbursement_account: number }) => {
    const res = await api.put(`/loans/${loanId}/disburse`, payload);
    return res.data;
  },

  getById: async (loanId: number): Promise<Loan> => {
    const res = await api.get(`/loans/${loanId}`);
    return res.data;
  },

  getInstallments: async (loanId: number): Promise<Installment[]> => {
    const res = await api.get(`/loans/${loanId}/installments`);
    return res.data;
  }
};

export default loanService;

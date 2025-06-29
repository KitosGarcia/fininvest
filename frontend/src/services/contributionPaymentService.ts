// src/services/contributionPaymentService.ts
import api from "../services/api";

export interface ContributionPayment {
  payment_id: number;
  payment_date: string;      // ISO
  method: string;
  amount: number;
  receipt_url?: string | null;
  notes?: string | null;
  created_by: string;
}

export const getByContribution = async (
  contributionId: number
): Promise<ContributionPayment[]> => {
  const { data } = await api.get(`/contributions/${contributionId}/payments`);
  return data;
};

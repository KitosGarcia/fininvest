// src/services/api/bankAccountService.ts
import api from "../api";

export interface BankAccount {
  account_id: number;
  account_name: string;
  bank_name: string;
  iban: string;
  account_type: string;
  currency: string;
  current_balance: number;
  is_active: boolean;
}

const getAll = async (): Promise<BankAccount[]> => {
  const response = await api.get("/bank-accounts");
  return response.data;
};

export const bankAccountService = {
  getAll,
};

export default bankAccountService;

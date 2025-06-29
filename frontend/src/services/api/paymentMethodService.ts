// src/services/api/paymentMethodService.ts
import api from "../../services/api";

export interface PaymentMethod {
  method_id: number;
  description: string;
}

export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const response = await api.get("/payment-methods");
  return response.data;
};

import api from "../../services/api";        // a tua instância axios

export interface Currency {
  currency_id: number;
  name: string;
  code: string;
  symbol: string;
  is_primary: boolean;
}

export const currencyService = {
  async list() {
    const { data } = await api.get<Currency[]>("/currencies");
    return data;
  },
  async create(payload: Omit<Currency, "currency_id" | "is_primary"> & { is_primary?: boolean }) {
    const { data } = await api.post<Currency>("/currencies", payload);
    return data;
  },
  async update(id: number, payload: Partial<Currency>) {
    const { data } = await api.put<Currency>(`/currencies/${id}`, payload);
    return data;
  },
  async remove(id: number) {
    return api.delete(`/currencies/${id}`);
  },
};

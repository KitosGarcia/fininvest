import api from "../api";

export interface Alert {
  alert_id: number;
  type: string;
  message: string;
  status: "unread" | "read";
  created_at: string;
  read_at?: string;
}

export const alertService = {
  getAll: async (): Promise<Alert[]> => {
    const res = await api.get("/alerts?status=unread");
    return res.data;
  },

  markAsRead: async (id: number): Promise<void> => {
    await api.put(`/alerts/${id}/read`);
  }
};

import api from "../../services/api";   

export const userService = {
  // Obter todos os utilizadores
  getAll: async () => {
    const response = await api.get("/users");
    return response.data;
  },

  // Obter todos os roles (perfis)
  getRoles: async () => {
    const response = await api.get("/roles");
    return response.data;
  },

  // Criar novo utilizador
  create: async (userData: {
    member_id?: number | null;
    username: string;
    password: string;
    role_id: number;
    two_factor_enabled?: boolean;
  }) => {
    const response = await api.post("/users", userData);
    return response.data;
  },

  // Atualizar utilizador
  update: async (
    userId: number,
    updates: {
      member_id?: number | null;
      username?: string;
      role_id?: number;
      two_factor_enabled?: boolean;
    }
  ) => {
    const response = await api.put(`/users/${userId}`, updates);
    return response.data;
  },

  // Eliminar utilizador (se implementares depois)
  delete: async (userId: number) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },
};

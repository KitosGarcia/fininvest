import axios from "axios";

// Define URL base da API (ex: http://localhost:5000 ou do .env)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Cria uma instância única do axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

// Intercepta todas as requisições para incluir o token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepta respostas para tratar erros globais (como 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
      window.location.href = "/login"; // força logout
    }
    return Promise.reject(error);
  }
);


// -----------------------------
// Serviço de Autenticação
// -----------------------------
export const authService = {
  login: async (username: string, password: string) => {
    const response = await api.post("/auth/login", { username, password });
    return response.data; // { token, user }
  },

  logout: () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    window.location.href = "/login";
  },

  isAuthenticated: () => {
    return localStorage.getItem("auth_token") !== null;
  },

  getCurrentUser: () => {
    const userData = localStorage.getItem("user_data");
    return userData ? JSON.parse(userData) : null;
  },
};


// Serviço de dashboard
export const dashboardService = {
  getStats: async () => {
    try {
      const response = await api.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      // Retornar dados de fallback em caso de erro
      console.warn('Erro ao carregar estatísticas, usando dados de fallback:', error);
      return {
        totalMembers: { value: "156", change: 12 },
        activeLoans: { value: "42", change: -3 },
        monthlyContributions: { value: "€23,450", change: 8 },
        totalBalance: { value: "€187,320", change: 15 }
      };
    }
  },
  
  getRecentActivity: async () => {
    try {
      const response = await api.get('/dashboard/recent-activity');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getAlerts: async () => {
    try {
      const response = await api.get('/dashboard/alerts');
      return response.data;
    } catch (error) {
      // Retornar dados de fallback em caso de erro
      console.warn('Erro ao carregar alertas, usando dados de fallback:', error);
      return [
        "3 quotas em atraso requerem atenção",
        "Novo empréstimo aguarda aprovação",
        "Backup automático concluído com sucesso"
      ];
    }
  },
  
  getFinancialPerformance: async (period: string) => {
    try {
      const response = await api.get(`/dashboard/financial-performance?period=${period}`);
      return response.data;
    } catch (error) {
      // Retornar dados de fallback em caso de erro
      console.warn('Erro ao carregar desempenho financeiro, usando dados de fallback:', error);
      return {
        loans: [12000, 15000, 18000, 22000, 19000, 25000, 28000, 24000, 30000, 27000, 32000, 35000],
        contributions: [8000, 8500, 9000, 8800, 9200, 9500, 9800, 9600, 10000, 9900, 10200, 10500]
      };
    }
  },
  
  getLoanStatus: async () => {
    try {
      const response = await api.get('/dashboard/loan-status');
      return response.data;
    } catch (error) {
      // Retornar dados de fallback em caso de erro
      console.warn('Erro ao carregar status dos empréstimos, usando dados de fallback:', error);
      return {
        labels: ['Aprovados', 'Pendentes', 'Em Análise', 'Rejeitados'],
        counts: [42, 23, 8, 3]
      };
    }
  },
  
  getRecentActivities: async (limit: number = 10) => {
    try {
      const response = await api.get(`/dashboard/recent-activities?limit=${limit}`);
      return response.data;
    } catch (error) {
      // Retornar dados de fallback em caso de erro
      console.warn('Erro ao carregar atividades recentes, usando dados de fallback:', error);
      return [
        {
          id: 1,
          type: 'Empréstimo',
          description: 'Novo empréstimo aprovado para João Silva',
          amount: 5000,
          date: new Date().toISOString(),
          status: 'approved'
        },
        {
          id: 2,
          type: 'Contribuição',
          description: 'Contribuição mensal recebida de Maria Santos',
          amount: 150,
          date: new Date(Date.now() - 86400000).toISOString(),
          status: 'completed'
        },
        {
          id: 3,
          type: 'Sócio',
          description: 'Novo sócio registado: Pedro Costa',
          amount: 0,
          date: new Date(Date.now() - 172800000).toISOString(),
          status: 'active'
        },
        {
          id: 4,
          type: 'Transferência',
          description: 'Transferência interna processada',
          amount: 1200,
          date: new Date(Date.now() - 259200000).toISOString(),
          status: 'completed'
        },
        {
          id: 5,
          type: 'Pagamento',
          description: 'Pagamento de quota em atraso regularizado',
          amount: 300,
          date: new Date(Date.now() - 345600000).toISOString(),
          status: 'completed'
        }
      ];
    }
  },
};

// Serviço de sócios
export const memberService = {
  getAll: async () => {
    try {
      const response = await api.get('/members');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getById: async (id: string) => {
    try {
      const response = await api.get(`/members/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  create: async (memberData: any) => {
    try {
      const response = await api.post('/members', memberData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  update: async (id: string, memberData: any) => {
    try {
      const response = await api.put(`/members/${id}`, memberData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  delete: async (id: string) => {
    try {
      const response = await api.delete(`/members/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getStatement: async (id: string, startDate: string, endDate: string) => {
    try {
      const response = await api.get(`/members/${id}/statement?startDate=${startDate}&endDate=${endDate}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getMembershipAgreement: async (id: string) => {
    try {
      const response = await api.get(`/members/${id}/agreement`, { responseType: 'blob' });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Serviço de clientes
export const clientService = {
  getAll: async () => {
    try {
      const response = await api.get('/clients');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getById: async (id: string) => {
    try {
      const response = await api.get(`/clients/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  create: async (clientData: any) => {
    try {
      const response = await api.post('/clients', clientData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  update: async (id: string, clientData: any) => {
    try {
      const response = await api.put(`/clients/${id}`, clientData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  delete: async (id: string) => {
    try {
      const response = await api.delete(`/clients/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Serviço de empréstimos
export const loanService = {
  getAll: async () => {
    try {
      const response = await api.get('/loans');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getById: async (id: string) => {
    try {
      const response = await api.get(`/loans/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  create: async (loanData: any) => {
    try {
      const response = await api.post('/loans', loanData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  update: async (id: string, loanData: any) => {
    try {
      const response = await api.put(`/loans/${id}`, loanData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  delete: async (id: string) => {
    try {
      const response = await api.delete(`/loans/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  approve: async (id: string, approvalData: any) => {
    try {
      const response = await api.post(`/loans/${id}/approve`, approvalData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  reject: async (id: string, reason: string) => {
    try {
      const response = await api.post(`/loans/${id}/reject`, { reason });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getStatement: async (id: string) => {
    try {
      const response = await api.get(`/loans/${id}/statement`, { responseType: 'blob' });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getContract: async (id: string) => {
    try {
      const response = await api.get(`/loans/${id}/contract`, { responseType: 'blob' });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Serviço de contribuições
export const contributionService = {
  getAll: async () => {
    try {
      const response = await api.get('/contributions');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getById: async (id: string) => {
    try {
      const response = await api.get(`/contributions/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  create: async (contributionData: any) => {
    try {
      const response = await api.post('/contributions', contributionData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  update: async (id: string, contributionData: any) => {
    try {
      const response = await api.put(`/contributions/${id}`, contributionData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  delete: async (id: string) => {
    try {
      const response = await api.delete(`/contributions/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  confirm: async (id: string, paymentData: any) => {
    try {
      const response = await api.post(`/contributions/${id}/confirm`, paymentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getReceipt: async (id: string) => {
    try {
      const response = await api.get(`/contributions/${id}/receipt`, { responseType: 'blob' });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Serviço de contas bancárias
export const bankAccountService = {
  getAll: async () => {
    try {
      const response = await api.get('/bank-accounts');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getById: async (id: string) => {
    try {
      const response = await api.get(`/bank-accounts/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  create: async (accountData: any) => {
    try {
      const response = await api.post('/bank-accounts', accountData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  update: async (id: string, accountData: any) => {
    try {
      const response = await api.put(`/bank-accounts/${id}`, accountData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  delete: async (id: string) => {
    try {
      const response = await api.delete(`/bank-accounts/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Serviço de transferências internas
export const internalTransferService = {
  getAll: async () => {
    try {
      const response = await api.get('/internal-transfers');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getById: async (id: string) => {
    try {
      const response = await api.get(`/internal-transfers/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  create: async (transferData: any) => {
    try {
      const response = await api.post('/internal-transfers', transferData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getProof: async (id: string) => {
    try {
      const response = await api.get(`/internal-transfers/${id}/proof`, { responseType: 'blob' });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Serviço de automação
export const automationService = {
  generateMonthlyQuotas: async (year: number, month: number) => {
    try {
      const response = await api.post('/automation/generate-monthly-quotas', { year, month });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  checkOverdueQuotas: async (daysOverdue: number) => {
    try {
      const response = await api.post('/automation/check-overdue-quotas', { daysOverdue });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Serviço de notificações
export const notificationService = {
  getAll: async () => {
    try {
      const response = await api.get('/notifications');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  markAsRead: async (id: string) => {
    try {
      const response = await api.put(`/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  markAllAsRead: async () => {
    try {
      const response = await api.put('/notifications/read-all');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Serviço de logs de auditoria
export const auditLogService = {
  getAll: async (filters: any = {}) => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, String(value));
      });
      
      const response = await api.get(`/audit-logs?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default api;


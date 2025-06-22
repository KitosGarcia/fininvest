import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown, 
  FileText, 
  Edit, 
  CheckCircle,
  XCircle,
  AlertCircle 
} from 'lucide-react';
import { loanService } from '../../services/api';

interface Loan {
  id: string;
  clientName: string;
  clientId: string;
  amount: number;
  interestRate: number;
  term: number;
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'defaulted';
  paymentsMade: number;
  paymentsTotal: number;
  amountPaid: number;
  nextPaymentDate: string;
}

const LoanList = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('startDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await loanService.getAll();
      setLoans(data);
    } catch (err) {
      console.error('Erro ao carregar empréstimos:', err);
      setError('Falha ao carregar a lista de empréstimos. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredLoans = loans
    .filter(loan => 
      (statusFilter === 'all' || loan.status === statusFilter) &&
      (loan.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
       loan.id.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortField === 'amount') {
        return sortDirection === 'asc' 
          ? a.amount - b.amount 
          : b.amount - a.amount;
      } else if (sortField === 'startDate') {
        return sortDirection === 'asc' 
          ? new Date(a.startDate).getTime() - new Date(b.startDate).getTime() 
          : new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      } else if (sortField === 'clientName') {
        return sortDirection === 'asc' 
          ? a.clientName.localeCompare(b.clientName) 
          : b.clientName.localeCompare(a.clientName);
      }
      return 0;
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/20 text-green-500';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'rejected':
        return 'bg-red-500/20 text-red-500';
      case 'completed':
        return 'bg-blue-500/20 text-blue-500';
      case 'defaulted':
        return 'bg-destructive/20 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Aprovado';
      case 'pending':
        return 'Pendente';
      case 'rejected':
        return 'Rejeitado';
      case 'completed':
        return 'Concluído';
      case 'defaulted':
        return 'Inadimplente';
      default:
        return status;
    }
  };

  const handleApprove = async (id: string) => {
    if (confirm('Tem certeza que deseja aprovar este empréstimo?')) {
      try {
        await loanService.approve(id, { approvalDate: new Date().toISOString() });
        fetchLoans();
      } catch (err) {
        console.error('Erro ao aprovar empréstimo:', err);
        setError('Falha ao aprovar empréstimo. Por favor, tente novamente.');
      }
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Por favor, informe o motivo da rejeição:');
    if (reason) {
      try {
        await loanService.reject(id, reason);
        fetchLoans();
      } catch (err) {
        console.error('Erro ao rejeitar empréstimo:', err);
        setError('Falha ao rejeitar empréstimo. Por favor, tente novamente.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-orbitron font-bold">Empréstimos</h1>
          <p className="text-muted-foreground mt-1">Gerencie os empréstimos do fundo</p>
        </div>
        <button 
          className="bg-primary hover:bg-primary/90 text-primary-foreground py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors"
          onClick={() => window.location.href = '/loans/new'}
        >
          <Plus size={18} />
          <span>Novo Empréstimo</span>
        </button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive p-4 rounded-lg flex items-start space-x-3">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="glass rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Pesquisar empréstimos..."
              className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <Filter size={18} className="text-muted-foreground" />
              <select
                className="bg-muted/50 border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Todos os status</option>
                <option value="pending">Pendentes</option>
                <option value="approved">Aprovados</option>
                <option value="rejected">Rejeitados</option>
                <option value="completed">Concluídos</option>
                <option value="defaulted">Inadimplentes</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/30">
                <th className="text-left py-3 px-4 font-medium">ID</th>
                <th 
                  className="text-left py-3 px-4 font-medium cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleSort('clientName')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Cliente</span>
                    {sortField === 'clientName' && (
                      <ArrowUpDown size={16} className={sortDirection === 'asc' ? 'transform rotate-180' : ''} />
                    )}
                  </div>
                </th>
                <th 
                  className="text-right py-3 px-4 font-medium cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Valor</span>
                    {sortField === 'amount' && (
                      <ArrowUpDown size={16} className={sortDirection === 'asc' ? 'transform rotate-180' : ''} />
                    )}
                  </div>
                </th>
                <th className="text-center py-3 px-4 font-medium">Taxa de Juros</th>
                <th className="text-center py-3 px-4 font-medium">Prazo (meses)</th>
                <th 
                  className="text-center py-3 px-4 font-medium cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleSort('startDate')}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>Data de Início</span>
                    {sortField === 'startDate' && (
                      <ArrowUpDown size={16} className={sortDirection === 'asc' ? 'transform rotate-180' : ''} />
                    )}
                  </div>
                </th>
                <th className="text-center py-3 px-4 font-medium">Status</th>
                <th className="text-center py-3 px-4 font-medium">Pagamentos</th>
                <th className="text-right py-3 px-4 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center">
                    <div className="flex justify-center items-center">
                      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredLoans.length > 0 ? (
                filteredLoans.map((loan) => (
                  <tr key={loan.id} className="border-t border-border hover:bg-muted/10 transition-colors">
                    <td className="py-3 px-4">
                      <a href={`/loans/${loan.id}`} className="text-primary hover:underline">
                        #{loan.id.substring(0, 8)}
                      </a>
                    </td>
                    <td className="py-3 px-4">
                      <a href={`/clients/${loan.clientId}`} className="text-primary hover:underline">
                        {loan.clientName}
                      </a>
                    </td>
                    <td className="py-3 px-4 text-right">€{loan.amount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center">{loan.interestRate}%</td>
                    <td className="py-3 px-4 text-center">{loan.term}</td>
                    <td className="py-3 px-4 text-center">{new Date(loan.startDate).toLocaleDateString('pt-PT')}</td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center">
                        <span className={`inline-block rounded-full px-3 py-1 text-xs ${getStatusColor(loan.status)}`}>
                          {getStatusText(loan.status)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {loan.paymentsMade}/{loan.paymentsTotal}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end space-x-2">
                        <button 
                          className="p-1 hover:bg-muted/50 rounded-md transition-colors"
                          title="Ver detalhes"
                          onClick={() => window.location.href = `/loans/${loan.id}`}
                        >
                          <FileText size={18} />
                        </button>
                        {loan.status === 'pending' && (
                          <>
                            <button 
                              className="p-1 hover:bg-green-500/20 text-green-500 rounded-md transition-colors"
                              title="Aprovar"
                              onClick={() => handleApprove(loan.id)}
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button 
                              className="p-1 hover:bg-red-500/20 text-red-500 rounded-md transition-colors"
                              title="Rejeitar"
                              onClick={() => handleReject(loan.id)}
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                        {loan.status === 'approved' && (
                          <button 
                            className="p-1 hover:bg-muted/50 rounded-md transition-colors"
                            title="Registrar Pagamento"
                            onClick={() => window.location.href = `/loans/${loan.id}/payment`}
                          >
                            <Edit size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-muted-foreground">
                    Nenhum empréstimo encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LoanList;

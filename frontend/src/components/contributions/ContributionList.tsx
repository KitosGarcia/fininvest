import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown, 
  FileText, 
  Edit, 
  Trash2, 
  AlertCircle,
  Receipt
} from 'lucide-react';
import { contributionService } from '../../services/api';

interface Contribution {
  id: string;
  memberName: string;
  memberId: string;
  amount: number;
  date: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  paymentMethod: string;
  receiptId: string | null;
}

const ContributionList = () => {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('dueDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchContributions();
  }, []);

  const fetchContributions = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await contributionService.getAll();
      setContributions(data);
    } catch (err) {
      console.error('Erro ao carregar contribuições:', err);
      setError('Falha ao carregar a lista de contribuições. Por favor, tente novamente.');
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

  const filteredContributions = contributions
    .filter(contribution => 
      (statusFilter === 'all' || contribution.status === statusFilter) &&
      (contribution.memberName.toLowerCase().includes(searchTerm.toLowerCase()) || 
       contribution.id.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortField === 'amount') {
        return sortDirection === 'asc' 
          ? a.amount - b.amount 
          : b.amount - a.amount;
      } else if (sortField === 'dueDate') {
        return sortDirection === 'asc' 
          ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime() 
          : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      } else if (sortField === 'memberName') {
        return sortDirection === 'asc' 
          ? a.memberName.localeCompare(b.memberName) 
          : b.memberName.localeCompare(a.memberName);
      }
      return 0;
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500/20 text-green-500';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'overdue':
        return 'bg-red-500/20 text-red-500';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Pago';
      case 'pending':
        return 'Pendente';
      case 'overdue':
        return 'Atrasado';
      default:
        return status;
    }
  };

  const handleConfirmPayment = async (id: string) => {
    try {
      const paymentData = {
        paymentDate: new Date().toISOString(),
        paymentMethod: 'Transferência Bancária'
      };
      await contributionService.confirm(id, paymentData);
      fetchContributions();
    } catch (err) {
      console.error('Erro ao confirmar pagamento:', err);
      setError('Falha ao confirmar pagamento. Por favor, tente novamente.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-orbitron font-bold">Contribuições</h1>
          <p className="text-muted-foreground mt-1">Gerencie as contribuições e quotas dos sócios</p>
        </div>
        <button 
          className="bg-primary hover:bg-primary/90 text-primary-foreground py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors"
          onClick={() => window.location.href = '/contributions/new'}
        >
          <Plus size={18} />
          <span>Nova Contribuição</span>
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
              placeholder="Pesquisar contribuições..."
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
                <option value="paid">Pagos</option>
                <option value="pending">Pendentes</option>
                <option value="overdue">Atrasados</option>
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
                  onClick={() => handleSort('memberName')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Sócio</span>
                    {sortField === 'memberName' && (
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
                <th 
                  className="text-center py-3 px-4 font-medium cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleSort('dueDate')}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>Data de Vencimento</span>
                    {sortField === 'dueDate' && (
                      <ArrowUpDown size={16} className={sortDirection === 'asc' ? 'transform rotate-180' : ''} />
                    )}
                  </div>
                </th>
                <th className="text-center py-3 px-4 font-medium">Data de Pagamento</th>
                <th className="text-center py-3 px-4 font-medium">Status</th>
                <th className="text-center py-3 px-4 font-medium">Método de Pagamento</th>
                <th className="text-right py-3 px-4 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center">
                    <div className="flex justify-center items-center">
                      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredContributions.length > 0 ? (
                filteredContributions.map((contribution) => (
                  <tr key={contribution.id} className="border-t border-border hover:bg-muted/10 transition-colors">
                    <td className="py-3 px-4">
                      <a href={`/contributions/${contribution.id}`} className="text-primary hover:underline">
                        #{contribution.id.substring(0, 8)}
                      </a>
                    </td>
                    <td className="py-3 px-4">
                      <a href={`/members/${contribution.memberId}`} className="text-primary hover:underline">
                        {contribution.memberName}
                      </a>
                    </td>
                    <td className="py-3 px-4 text-right">€{contribution.amount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center">{new Date(contribution.dueDate).toLocaleDateString('pt-PT')}</td>
                    <td className="py-3 px-4 text-center">
                      {contribution.date ? new Date(contribution.date).toLocaleDateString('pt-PT') : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center">
                        <span className={`inline-block rounded-full px-3 py-1 text-xs ${getStatusColor(contribution.status)}`}>
                          {getStatusText(contribution.status)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {contribution.paymentMethod || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end space-x-2">
                        <button 
                          className="p-1 hover:bg-muted/50 rounded-md transition-colors"
                          title="Ver detalhes"
                          onClick={() => window.location.href = `/contributions/${contribution.id}`}
                        >
                          <FileText size={18} />
                        </button>
                        {contribution.status === 'pending' && (
                          <button 
                            className="p-1 hover:bg-green-500/20 text-green-500 rounded-md transition-colors"
                            title="Confirmar Pagamento"
                            onClick={() => handleConfirmPayment(contribution.id)}
                          >
                            <Edit size={18} />
                          </button>
                        )}
                        {contribution.status === 'paid' && contribution.receiptId && (
                          <button 
                            className="p-1 hover:bg-blue-500/20 text-blue-500 rounded-md transition-colors"
                            title="Ver Recibo"
                            onClick={() => window.location.href = `/receipts/${contribution.receiptId}`}
                          >
                            <Receipt size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground">
                    Nenhuma contribuição encontrada
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

export default ContributionList;

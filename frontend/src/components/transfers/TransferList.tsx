import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown, 
  FileText, 
  AlertCircle,
  ArrowLeftRight,
  Calendar
} from 'lucide-react';
import { internalTransferService } from '../../services/api';

interface Transfer {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  fromAccountName: string;
  toAccountName: string;
  amount: number;
  date: string;
  description: string;
  reference: string;
  proofId: string | null;
}

const TransferList = () => {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [dateFilter, setDateFilter] = useState<string>('all');

  useEffect(() => {
    fetchTransfers();
  }, []);

  const fetchTransfers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await internalTransferService.getAll();
      setTransfers(data);
    } catch (err) {
      console.error('Erro ao carregar transferências:', err);
      setError('Falha ao carregar a lista de transferências. Por favor, tente novamente.');
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

  const getDateFilterRange = () => {
    const today = new Date();
    switch (dateFilter) {
      case 'today':
        return {
          start: new Date(today.setHours(0, 0, 0, 0)),
          end: new Date(today.setHours(23, 59, 59, 999))
        };
      case 'week':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        return { start: startOfWeek, end: endOfWeek };
      case 'month':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
        return { start: startOfMonth, end: endOfMonth };
      default:
        return null;
    }
  };

  const filteredTransfers = transfers
    .filter(transfer => {
      // Aplicar filtro de data se selecionado
      if (dateFilter !== 'all') {
        const range = getDateFilterRange();
        if (range) {
          const transferDate = new Date(transfer.date);
          if (transferDate < range.start || transferDate > range.end) {
            return false;
          }
        }
      }
      
      // Aplicar filtro de pesquisa
      return (
        transfer.fromAccountName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        transfer.toAccountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transfer.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transfer.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
    .sort((a, b) => {
      if (sortField === 'amount') {
        return sortDirection === 'asc' 
          ? a.amount - b.amount 
          : b.amount - a.amount;
      } else if (sortField === 'date') {
        return sortDirection === 'asc' 
          ? new Date(a.date).getTime() - new Date(b.date).getTime() 
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortField === 'fromAccountName') {
        return sortDirection === 'asc' 
          ? a.fromAccountName.localeCompare(b.fromAccountName) 
          : b.fromAccountName.localeCompare(a.fromAccountName);
      } else if (sortField === 'toAccountName') {
        return sortDirection === 'asc' 
          ? a.toAccountName.localeCompare(b.toAccountName) 
          : b.toAccountName.localeCompare(a.toAccountName);
      }
      return 0;
    });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-orbitron font-bold">Transferências</h1>
          <p className="text-muted-foreground mt-1">Gerencie as transferências entre contas bancárias</p>
        </div>
        <button 
          className="bg-primary hover:bg-primary/90 text-primary-foreground py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors"
          onClick={() => window.location.href = '/transfers/new'}
        >
          <Plus size={18} />
          <span>Nova Transferência</span>
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
              placeholder="Pesquisar transferências..."
              className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <Calendar size={18} className="text-muted-foreground" />
              <select
                className="bg-muted/50 border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="all">Todas as datas</option>
                <option value="today">Hoje</option>
                <option value="week">Esta semana</option>
                <option value="month">Este mês</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/30">
                <th className="text-left py-3 px-4 font-medium">Referência</th>
                <th 
                  className="text-left py-3 px-4 font-medium cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleSort('fromAccountName')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Conta de Origem</span>
                    {sortField === 'fromAccountName' && (
                      <ArrowUpDown size={16} className={sortDirection === 'asc' ? 'transform rotate-180' : ''} />
                    )}
                  </div>
                </th>
                <th 
                  className="text-left py-3 px-4 font-medium cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleSort('toAccountName')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Conta de Destino</span>
                    {sortField === 'toAccountName' && (
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
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>Data</span>
                    {sortField === 'date' && (
                      <ArrowUpDown size={16} className={sortDirection === 'asc' ? 'transform rotate-180' : ''} />
                    )}
                  </div>
                </th>
                <th className="text-left py-3 px-4 font-medium">Descrição</th>
                <th className="text-right py-3 px-4 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center">
                    <div className="flex justify-center items-center">
                      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredTransfers.length > 0 ? (
                filteredTransfers.map((transfer) => (
                  <tr key={transfer.id} className="border-t border-border hover:bg-muted/10 transition-colors">
                    <td className="py-3 px-4">
                      <a href={`/transfers/${transfer.id}`} className="text-primary hover:underline">
                        {transfer.reference}
                      </a>
                    </td>
                    <td className="py-3 px-4">
                      <a href={`/bank-accounts/${transfer.fromAccountId}`} className="text-primary hover:underline">
                        {transfer.fromAccountName}
                      </a>
                    </td>
                    <td className="py-3 px-4">
                      <a href={`/bank-accounts/${transfer.toAccountId}`} className="text-primary hover:underline">
                        {transfer.toAccountName}
                      </a>
                    </td>
                    <td className="py-3 px-4 text-right">€{transfer.amount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center">{new Date(transfer.date).toLocaleDateString('pt-PT')}</td>
                    <td className="py-3 px-4">{transfer.description}</td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end space-x-2">
                        <button 
                          className="p-1 hover:bg-muted/50 rounded-md transition-colors"
                          title="Ver detalhes"
                          onClick={() => window.location.href = `/transfers/${transfer.id}`}
                        >
                          <FileText size={18} />
                        </button>
                        {transfer.proofId && (
                          <button 
                            className="p-1 hover:bg-blue-500/20 text-blue-500 rounded-md transition-colors"
                            title="Ver Comprovante"
                            onClick={() => window.location.href = `/proofs/${transfer.proofId}`}
                          >
                            <ArrowLeftRight size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    Nenhuma transferência encontrada
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

export default TransferList;

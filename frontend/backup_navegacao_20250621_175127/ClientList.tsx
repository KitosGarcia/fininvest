import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown, 
  FileText, 
  Edit, 
  Trash2, 
  AlertCircle 
} from 'lucide-react';
import { clientService } from '../../services/api';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  registrationDate: string;
  type: 'internal' | 'external';
  loanCount: number;
  totalLoanAmount: number;
}

const ClientList = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await clientService.getAll();
      setClients(data);
    } catch (err) {
      console.error('Erro ao carregar clientes:', err);
      setError('Falha ao carregar a lista de clientes. Por favor, tente novamente.');
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

  const filteredClients = clients
    .filter(client => 
      (typeFilter === 'all' || client.type === typeFilter) &&
      (client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
       client.email.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortField === 'name') {
        return sortDirection === 'asc' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      } else if (sortField === 'registrationDate') {
        return sortDirection === 'asc' 
          ? new Date(a.registrationDate).getTime() - new Date(b.registrationDate).getTime() 
          : new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime();
      } else if (sortField === 'totalLoanAmount') {
        return sortDirection === 'asc' 
          ? a.totalLoanAmount - b.totalLoanAmount 
          : b.totalLoanAmount - a.totalLoanAmount;
      }
      return 0;
    });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'internal':
        return 'bg-blue-500/20 text-blue-500';
      case 'external':
        return 'bg-purple-500/20 text-purple-500';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'internal':
        return 'Interno';
      case 'external':
        return 'Externo';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-orbitron font-bold">Clientes</h1>
          <p className="text-muted-foreground mt-1">Gerencie os clientes do fundo</p>
        </div>
        <button 
          className="bg-primary hover:bg-primary/90 text-primary-foreground py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors"
          onClick={() => window.location.href = '/clients/new'}
        >
          <Plus size={18} />
          <span>Novo Cliente</span>
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
              placeholder="Pesquisar clientes..."
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
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">Todos os tipos</option>
                <option value="internal">Internos</option>
                <option value="external">Externos</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/30">
                <th 
                  className="text-left py-3 px-4 font-medium cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Nome</span>
                    {sortField === 'name' && (
                      <ArrowUpDown size={16} className={sortDirection === 'asc' ? 'transform rotate-180' : ''} />
                    )}
                  </div>
                </th>
                <th className="text-left py-3 px-4 font-medium">Email</th>
                <th className="text-left py-3 px-4 font-medium">Telefone</th>
                <th 
                  className="text-left py-3 px-4 font-medium cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleSort('registrationDate')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Data de Registo</span>
                    {sortField === 'registrationDate' && (
                      <ArrowUpDown size={16} className={sortDirection === 'asc' ? 'transform rotate-180' : ''} />
                    )}
                  </div>
                </th>
                <th className="text-center py-3 px-4 font-medium">Tipo</th>
                <th className="text-center py-3 px-4 font-medium">Empréstimos</th>
                <th 
                  className="text-right py-3 px-4 font-medium cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleSort('totalLoanAmount')}
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Total Emprestado</span>
                    {sortField === 'totalLoanAmount' && (
                      <ArrowUpDown size={16} className={sortDirection === 'asc' ? 'transform rotate-180' : ''} />
                    )}
                  </div>
                </th>
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
              ) : filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <tr key={client.id} className="border-t border-border hover:bg-muted/10 transition-colors">
                    <td className="py-3 px-4">
                      <a href={`/clients/${client.id}`} className="text-primary hover:underline">
                        {client.name}
                      </a>
                    </td>
                    <td className="py-3 px-4">{client.email}</td>
                    <td className="py-3 px-4">{client.phone}</td>
                    <td className="py-3 px-4">{new Date(client.registrationDate).toLocaleDateString('pt-PT')}</td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center">
                        <span className={`inline-block rounded-full px-3 py-1 text-xs ${getTypeColor(client.type)}`}>
                          {getTypeText(client.type)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">{client.loanCount}</td>
                    <td className="py-3 px-4 text-right">€{client.totalLoanAmount.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end space-x-2">
                        <button 
                          className="p-1 hover:bg-muted/50 rounded-md transition-colors"
                          title="Ver detalhes"
                          onClick={() => window.location.href = `/clients/${client.id}`}
                        >
                          <FileText size={18} />
                        </button>
                        <button 
                          className="p-1 hover:bg-muted/50 rounded-md transition-colors"
                          title="Editar"
                          onClick={() => window.location.href = `/clients/${client.id}/edit`}
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          className="p-1 hover:bg-destructive/20 text-destructive rounded-md transition-colors"
                          title="Excluir"
                          onClick={() => {
                            if (confirm('Tem certeza que deseja excluir este cliente?')) {
                              clientService.delete(client.id)
                                .then(() => fetchClients())
                                .catch(err => {
                                  console.error('Erro ao excluir cliente:', err);
                                  setError('Falha ao excluir cliente. Por favor, tente novamente.');
                                });
                            }
                          }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground">
                    Nenhum cliente encontrado
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

export default ClientList;

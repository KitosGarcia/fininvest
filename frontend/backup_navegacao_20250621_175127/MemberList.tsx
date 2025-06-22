import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown, 
  MoreHorizontal, 
  FileText, 
  Edit, 
  Trash2, 
  AlertCircle 
} from 'lucide-react';
import { memberService } from '../../services/api';

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  status: 'active' | 'inactive' | 'pending';
  contributionTotal: number;
}

const MemberList = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await memberService.getAll();
      setMembers(data);
    } catch (err) {
      console.error('Erro ao carregar sócios:', err);
      setError('Falha ao carregar a lista de sócios. Por favor, tente novamente.');
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

  const filteredMembers = members
    .filter(member => 
      (statusFilter === 'all' || member.status === statusFilter) &&
      (member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
       member.email.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortField === 'name') {
        return sortDirection === 'asc' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      } else if (sortField === 'joinDate') {
        return sortDirection === 'asc' 
          ? new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime() 
          : new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime();
      } else if (sortField === 'contributionTotal') {
        return sortDirection === 'asc' 
          ? a.contributionTotal - b.contributionTotal 
          : b.contributionTotal - a.contributionTotal;
      }
      return 0;
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-500';
      case 'inactive':
        return 'bg-red-500/20 text-red-500';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-500';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'inactive':
        return 'Inativo';
      case 'pending':
        return 'Pendente';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-orbitron font-bold">Sócios</h1>
          <p className="text-muted-foreground mt-1">Gerencie os sócios do fundo</p>
        </div>
        <button 
          className="bg-primary hover:bg-primary/90 text-primary-foreground py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors"
          onClick={() => window.location.href = '/members/new'}
        >
          <Plus size={18} />
          <span>Novo Sócio</span>
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
              placeholder="Pesquisar sócios..."
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
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
                <option value="pending">Pendentes</option>
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
                  onClick={() => handleSort('joinDate')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Data de Adesão</span>
                    {sortField === 'joinDate' && (
                      <ArrowUpDown size={16} className={sortDirection === 'asc' ? 'transform rotate-180' : ''} />
                    )}
                  </div>
                </th>
                <th className="text-center py-3 px-4 font-medium">Status</th>
                <th 
                  className="text-right py-3 px-4 font-medium cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleSort('contributionTotal')}
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Total Contribuído</span>
                    {sortField === 'contributionTotal' && (
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
                  <td colSpan={7} className="py-8 text-center">
                    <div className="flex justify-center items-center">
                      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="border-t border-border hover:bg-muted/10 transition-colors">
                    <td className="py-3 px-4">
                      <a href={`/members/${member.id}`} className="text-primary hover:underline">
                        {member.name}
                      </a>
                    </td>
                    <td className="py-3 px-4">{member.email}</td>
                    <td className="py-3 px-4">{member.phone}</td>
                    <td className="py-3 px-4">{new Date(member.joinDate).toLocaleDateString('pt-PT')}</td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center">
                        <span className={`inline-block rounded-full px-3 py-1 text-xs ${getStatusColor(member.status)}`}>
                          {getStatusText(member.status)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">€{member.contributionTotal.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end space-x-2">
                        <button 
                          className="p-1 hover:bg-muted/50 rounded-md transition-colors"
                          title="Ver detalhes"
                          onClick={() => window.location.href = `/members/${member.id}`}
                        >
                          <FileText size={18} />
                        </button>
                        <button 
                          className="p-1 hover:bg-muted/50 rounded-md transition-colors"
                          title="Editar"
                          onClick={() => window.location.href = `/members/${member.id}/edit`}
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          className="p-1 hover:bg-destructive/20 text-destructive rounded-md transition-colors"
                          title="Excluir"
                          onClick={() => {
                            if (confirm('Tem certeza que deseja excluir este sócio?')) {
                              memberService.delete(member.id)
                                .then(() => fetchMembers())
                                .catch(err => {
                                  console.error('Erro ao excluir sócio:', err);
                                  setError('Falha ao excluir sócio. Por favor, tente novamente.');
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
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    Nenhum sócio encontrado
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

export default MemberList;

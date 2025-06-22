import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  RefreshCw 
} from 'lucide-react';
import { automationService } from '../../services/api';

const AutomationPanel = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isGeneratingQuotas, setIsGeneratingQuotas] = useState(false);
  const [isCheckingOverdue, setIsCheckingOverdue] = useState(false);
  const [lastQuotaGeneration, setLastQuotaGeneration] = useState<string | null>(null);
  const [lastOverdueCheck, setLastOverdueCheck] = useState<string | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [daysOverdue, setDaysOverdue] = useState(5);

  useEffect(() => {
    // Aqui poderíamos buscar informações sobre as últimas execuções
    // de automação, se o backend fornecer esses dados
  }, []);

  const handleGenerateQuotas = async () => {
    setIsGeneratingQuotas(true);
    setError('');
    setSuccess('');
    
    try {
      const result = await automationService.generateMonthlyQuotas(year, month);
      setSuccess(`Quotas mensais geradas com sucesso! ${result.count} quotas foram criadas para ${result.memberCount} sócios.`);
      setLastQuotaGeneration(new Date().toISOString());
    } catch (err: any) {
      console.error('Erro ao gerar quotas mensais:', err);
      setError(err.response?.data?.message || 'Falha ao gerar quotas mensais. Por favor, tente novamente.');
    } finally {
      setIsGeneratingQuotas(false);
    }
  };

  const handleCheckOverdueQuotas = async () => {
    setIsCheckingOverdue(true);
    setError('');
    setSuccess('');
    
    try {
      const result = await automationService.checkOverdueQuotas(daysOverdue);
      setSuccess(`Verificação de quotas em atraso concluída! ${result.overdueCount} quotas em atraso foram identificadas e ${result.notificationCount} notificações foram enviadas.`);
      setLastOverdueCheck(new Date().toISOString());
    } catch (err: any) {
      console.error('Erro ao verificar quotas em atraso:', err);
      setError(err.response?.data?.message || 'Falha ao verificar quotas em atraso. Por favor, tente novamente.');
    } finally {
      setIsCheckingOverdue(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-orbitron font-bold">Automação</h1>
        <p className="text-muted-foreground mt-1">Gerencie processos automatizados do sistema</p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive p-4 rounded-lg flex items-start space-x-3">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-500 p-4 rounded-lg flex items-start space-x-3">
          <CheckCircle size={20} />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Geração de Quotas Mensais */}
        <div className="glass rounded-xl border border-border p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Calendar size={24} className="text-primary" />
            <h2 className="text-xl font-semibold">Geração de Quotas Mensais</h2>
          </div>
          
          <p className="text-muted-foreground mb-6">
            Gere automaticamente as quotas mensais para todos os sócios ativos. Este processo cria registros de contribuições pendentes para cada sócio.
          </p>
          
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="year" className="block text-sm font-medium mb-1">
                  Ano
                </label>
                <select
                  id="year"
                  className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                >
                  {[...Array(5)].map((_, i) => {
                    const yearValue = new Date().getFullYear() - 2 + i;
                    return (
                      <option key={yearValue} value={yearValue}>
                        {yearValue}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label htmlFor="month" className="block text-sm font-medium mb-1">
                  Mês
                </label>
                <select
                  id="month"
                  className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value))}
                >
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(0, i).toLocaleString('pt-PT', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {lastQuotaGeneration ? (
                <div className="flex items-center">
                  <Clock size={14} className="mr-1" />
                  <span>Última execução: {new Date(lastQuotaGeneration).toLocaleString('pt-PT')}</span>
                </div>
              ) : (
                <span>Nenhuma execução recente</span>
              )}
            </div>
            <button
              className={`bg-primary hover:bg-primary/90 text-primary-foreground py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors ${isGeneratingQuotas ? 'opacity-70' : ''}`}
              onClick={handleGenerateQuotas}
              disabled={isGeneratingQuotas}
            >
              {isGeneratingQuotas ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span>Processando...</span>
                </>
              ) : (
                <>
                  <Calendar size={18} />
                  <span>Gerar Quotas</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Verificação de Quotas em Atraso */}
        <div className="glass rounded-xl border border-border p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertCircle size={24} className="text-destructive" />
            <h2 className="text-xl font-semibold">Verificação de Quotas em Atraso</h2>
          </div>
          
          <p className="text-muted-foreground mb-6">
            Verifique quotas em atraso e envie notificações automáticas para os sócios inadimplentes. Este processo marca sócios como inadimplentes após o período especificado.
          </p>
          
          <div className="space-y-4 mb-6">
            <div>
              <label htmlFor="daysOverdue" className="block text-sm font-medium mb-1">
                Dias de Atraso
              </label>
              <input
                id="daysOverdue"
                type="number"
                min="1"
                max="90"
                className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                value={daysOverdue}
                onChange={(e) => setDaysOverdue(parseInt(e.target.value))}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Número de dias após o vencimento para considerar uma quota em atraso
              </p>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {lastOverdueCheck ? (
                <div className="flex items-center">
                  <Clock size={14} className="mr-1" />
                  <span>Última verificação: {new Date(lastOverdueCheck).toLocaleString('pt-PT')}</span>
                </div>
              ) : (
                <span>Nenhuma verificação recente</span>
              )}
            </div>
            <button
              className={`bg-destructive hover:bg-destructive/90 text-destructive-foreground py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors ${isCheckingOverdue ? 'opacity-70' : ''}`}
              onClick={handleCheckOverdueQuotas}
              disabled={isCheckingOverdue}
            >
              {isCheckingOverdue ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span>Verificando...</span>
                </>
              ) : (
                <>
                  <XCircle size={18} />
                  <span>Verificar Atrasos</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Histórico de Execuções */}
      <div className="glass rounded-xl border border-border p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Clock size={24} className="text-secondary" />
          <h2 className="text-xl font-semibold">Histórico de Automações</h2>
        </div>
        
        <p className="text-muted-foreground mb-6">
          Visualize o histórico de execuções de processos automatizados e seus resultados.
        </p>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/30">
                <th className="text-left py-3 px-4 font-medium">Processo</th>
                <th className="text-center py-3 px-4 font-medium">Data de Execução</th>
                <th className="text-center py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">Resultado</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center">
                    <div className="flex justify-center items-center">
                      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-muted-foreground">
                    O histórico de automações será implementado em breve
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

export default AutomationPanel;

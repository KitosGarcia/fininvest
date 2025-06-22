import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { 
  Users, 
  CreditCard, 
  PiggyBank, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Wallet
} from 'lucide-react';
import { dashboardService } from '../../services/api';

// Definir o tipo ApexOptions localmente para evitar erros de importação
type ApexOptions = any;

// Interface para atividades
interface Activity {
  id: number;
  type: string;
  description: string;
  amount: number;
  date: string;
  status: string;
}

// Componente de Card para estatísticas
interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: JSX.Element;
  color: string;
}

const StatCard = ({ title, value, change, icon, color }: StatCardProps) => {
  return (
    <div className="glass rounded-xl p-6 border border-border">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
          <div className="flex items-center mt-2">
            {change > 0 ? (
              <ArrowUpRight size={16} className="text-green-500 mr-1" />
            ) : (
              <ArrowDownRight size={16} className="text-red-500 mr-1" />
            )}
            <span className={change > 0 ? "text-green-500" : "text-red-500"}>
              {Math.abs(change)}%
            </span>
            <span className="text-xs text-muted-foreground ml-1">vs. mês anterior</span>
          </div>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// Componente de Gráfico de Linha
const LineChart = () => {
  const [period, setPeriod] = useState('year');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [chartData, setChartData] = useState<{
    options: ApexOptions;
    series: any[];
  }>({
    options: {
      chart: {
        type: 'area',
        height: 350,
        background: 'transparent',
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'smooth',
        width: 3,
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.1,
          stops: [0, 90, 100],
        },
      },
      grid: {
        borderColor: 'hsl(0, 0%, 20%)',
        strokeDashArray: 3,
      },
      xaxis: {
        categories: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
        labels: {
          style: {
            colors: 'hsl(0, 0%, 80%)',
          },
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: 'hsl(0, 0%, 80%)',
          },
          formatter: function (value) {
            return `€${value.toFixed(0)}`;
          },
        },
      },
      tooltip: {
        theme: 'dark',
        x: {
          show: false,
        },
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
        labels: {
          colors: 'hsl(0, 0%, 80%)',
        },
      },
    },
    series: [
      {
        name: 'Empréstimos',
        data: [],
      },
      {
        name: 'Contribuições',
        data: [],
      },
    ],
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await dashboardService.getFinancialPerformance(period);
        setChartData(prevState => ({
          ...prevState,
          series: [
            {
              name: 'Empréstimos',
              data: data.loans,
            },
            {
              name: 'Contribuições',
              data: data.contributions,
            },
          ],
        }));
      } catch (err) {
        console.error('Erro ao carregar desempenho financeiro:', err);
        setError('Falha ao carregar dados de desempenho financeiro');
        // Usar dados de fallback em caso de erro
        setChartData(prevState => ({
          ...prevState,
          series: [
            {
              name: 'Empréstimos',
              data: [12000, 15000, 18000, 22000, 19000, 25000, 28000, 24000, 30000, 27000, 32000, 35000],
            },
            {
              name: 'Contribuições',
              data: [8000, 8500, 9000, 8800, 9200, 9500, 9800, 9600, 10000, 9900, 10200, 10500],
            },
          ],
        }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [period]);

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPeriod(e.target.value);
  };

  return (
    <div className="glass rounded-xl p-6 border border-border">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Desempenho Financeiro</h3>
        <select 
          className="bg-muted/50 border border-border rounded-lg px-3 py-1 text-sm"
          value={period}
          onChange={handlePeriodChange}
        >
          <option value="year">Este Ano</option>
          <option value="month">Este Mês</option>
          <option value="week">Esta Semana</option>
        </select>
      </div>
      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}
      <div className="h-80 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
          </div>
        )}
        <ReactApexChart 
          options={chartData.options} 
          series={chartData.series} 
          type="area" 
          height="100%" 
        />
      </div>
    </div>
  );
};

// Componente de Gráfico de Rosca
const DonutChart = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [chartData, setChartData] = useState<{
    options: ApexOptions;
    series: number[];
  }>({
    options: {
      chart: {
        type: 'donut',
        background: 'transparent',
      },
      labels: ['Aprovados', 'Pendentes', 'Em Análise', 'Rejeitados'],
      colors: ['#10b981', '#f59e0b', '#3b82f6', '#ef4444'],
      legend: {
        position: 'bottom',
        labels: {
          colors: 'hsl(0, 0%, 80%)',
        },
      },
      plotOptions: {
        pie: {
          donut: {
            size: '70%',
            labels: {
              show: true,
              total: {
                show: true,
                label: 'Total',
                color: 'hsl(0, 0%, 80%)',
                formatter: function (w) {
                  return w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0).toString();
                },
              },
            },
          },
        },
      },
    },
    series: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await dashboardService.getLoanStatus();
        setChartData(prevState => ({
          ...prevState,
          series: data.counts,
          options: {
            ...prevState.options,
            labels: data.labels
          }
        }));
      } catch (err) {
        console.error('Erro ao carregar status dos empréstimos:', err);
        setError('Falha ao carregar dados de status dos empréstimos');
        // Usar dados de fallback em caso de erro
        setChartData(prevState => ({
          ...prevState,
          series: [42, 23, 8, 3],
        }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="glass rounded-xl p-6 border border-border">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Status dos Empréstimos</h3>
      </div>
      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}
      <div className="h-80 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
          </div>
        )}
        <ReactApexChart 
          options={chartData.options} 
          series={chartData.series} 
          type="donut" 
          height="100%" 
        />
      </div>
    </div>
  );
};

// Componente de Atividades Recentes
const RecentActivities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await dashboardService.getRecentActivities(5);
        setActivities(data);
      } catch (err) {
        console.error('Erro ao carregar atividades recentes:', err);
        setError('Falha ao carregar atividades recentes');
        // Usar dados de fallback em caso de erro
        setActivities([
          {
            id: 1,
            type: 'Empréstimo',
            description: 'Aprovação de empréstimo #12345',
            amount: 5000,
            date: '26 Mai 2025',
            status: 'completed',
          },
          {
            id: 2,
            type: 'Contribuição',
            description: 'Quota mensal de João Silva',
            amount: 500,
            date: '25 Mai 2025',
            status: 'completed',
          },
          {
            id: 3,
            type: 'Pagamento',
            description: 'Parcela de empréstimo #10982',
            amount: 750,
            date: '24 Mai 2025',
            status: 'pending',
          },
          {
            id: 4,
            type: 'Transferência',
            description: 'Transferência entre contas',
            amount: 2000,
            date: '23 Mai 2025',
            status: 'completed',
          },
          {
            id: 5,
            type: 'Empréstimo',
            description: 'Solicitação de empréstimo #12346',
            amount: 7500,
            date: '22 Mai 2025',
            status: 'pending',
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-500';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'approved':
        return 'bg-blue-500/20 text-blue-500';
      case 'active':
        return 'bg-green-500/20 text-green-500';
      default:
        return 'bg-gray-500/20 text-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluído';
      case 'pending':
        return 'Pendente';
      case 'approved':
        return 'Aprovado';
      case 'active':
        return 'Ativo';
      default:
        return status;
    }
  };

  return (
    <div className="glass rounded-xl p-6 border border-border">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Atividades Recentes</h3>
      </div>
      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
          </div>
        )}
        {!isLoading && (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Tipo</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Descrição</th>
                <th className="text-right py-3 px-2 font-medium text-muted-foreground">Valor</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                <th className="text-right py-3 px-2 font-medium text-muted-foreground">Data</th>
              </tr>
            </thead>
            <tbody>
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <tr key={activity.id} className="border-b border-border hover:bg-muted/10 transition-colors">
                    <td className="py-3 px-2">{activity.type}</td>
                    <td className="py-3 px-2">{activity.description}</td>
                    <td className="py-3 px-2 text-right">€{activity.amount.toLocaleString()}</td>
                    <td className="py-3 px-2">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs ${getStatusColor(activity.status)}`}>
                        {getStatusText(activity.status)}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right text-muted-foreground">{activity.date}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    Nenhuma atividade recente encontrada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// Componente principal do Dashboard
const Dashboard = () => {
  const [stats, setStats] = useState({
    totalMembers: { value: "0", change: 0 },
    activeLoans: { value: "0", change: 0 },
    monthlyContributions: { value: "€0", change: 0 },
    totalBalance: { value: "€0", change: 0 }
  });
  const [alerts, setAlerts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError('');
      try {
        // Carregar estatísticas
        const statsData = await dashboardService.getStats();
        setStats({
          totalMembers: { 
            value: statsData.totalMembers.value.toString(), 
            change: statsData.totalMembers.change 
          },
          activeLoans: { 
            value: statsData.activeLoans.value.toString(), 
            change: statsData.activeLoans.change 
          },
          monthlyContributions: { 
            value: `€${statsData.monthlyContributions.value.toLocaleString()}`, 
            change: statsData.monthlyContributions.change 
          },
          totalBalance: { 
            value: `€${statsData.totalBalance.value.toLocaleString()}`, 
            change: statsData.totalBalance.change 
          }
        });

        // Carregar alertas
        const alertsData = await dashboardService.getAlerts();
        setAlerts(alertsData);
      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err);
        setError('Falha ao carregar alguns dados do dashboard');
        // Usar dados de fallback em caso de erro
        setStats({
          totalMembers: { value: "128", change: 5.2 },
          activeLoans: { value: "76", change: 12.3 },
          monthlyContributions: { value: "€42.500", change: -2.5 },
          totalBalance: { value: "€1.245.000", change: 8.7 }
        });
        setAlerts([
          '3 empréstimos com parcelas em atraso há mais de 30 dias',
          '5 sócios com contribuições pendentes para o mês atual',
          'Saldo baixo na conta bancária principal (€2.500)'
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-orbitron font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visão geral do desempenho financeiro</p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10 rounded-lg">
            <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
          </div>
        )}
        <StatCard 
          title="Total de Sócios" 
          value={stats.totalMembers.value} 
          change={stats.totalMembers.change} 
          icon={<Users size={24} className="text-white" />} 
          color="bg-primary/20"
        />
        <StatCard 
          title="Empréstimos Ativos" 
          value={stats.activeLoans.value} 
          change={stats.activeLoans.change} 
          icon={<CreditCard size={24} className="text-white" />} 
          color="bg-secondary/20"
        />
        <StatCard 
          title="Contribuições Mensais" 
          value={stats.monthlyContributions.value} 
          change={stats.monthlyContributions.change} 
          icon={<PiggyBank size={24} className="text-white" />} 
          color="bg-accent/20"
        />
        <StatCard 
          title="Saldo Total" 
          value={stats.totalBalance.value} 
          change={stats.totalBalance.change} 
          icon={<Wallet size={24} className="text-white" />} 
          color="bg-primary/20"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LineChart />
        </div>
        <div>
          <DonutChart />
        </div>
      </div>

      {/* Atividades Recentes */}
      <div>
        <RecentActivities />
      </div>

      {/* Alertas */}
      {alerts && alerts.length > 0 && (
        <div className="glass rounded-xl p-6 border border-destructive/30">
          <div className="flex items-start space-x-4">
            <div className="p-3 rounded-lg bg-destructive/20">
              <AlertTriangle size={24} className="text-destructive" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Alertas de Atenção</h3>
              <ul className="space-y-2 text-muted-foreground">
                {alerts.map((alert, index) => (
                  <li key={index} className="flex items-center">
                    <span className="w-2 h-2 bg-destructive rounded-full mr-3"></span>
                    {alert}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;


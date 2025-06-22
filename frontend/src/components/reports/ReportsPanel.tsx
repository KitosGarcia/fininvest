import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  PieChart, 
  LineChart, 
  Download, 
  Calendar, 
  Filter, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import ReactApexChart from 'react-apexcharts';

// Definir o tipo ApexOptions localmente para evitar erros de importação
type ApexOptions = any;

const ReportsPanel = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportType, setReportType] = useState('financial');
  const [dateRange, setDateRange] = useState('month');
  const [startDate, setStartDate] = useState(
    new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [chartData, setChartData] = useState<{
    options: ApexOptions;
    series: ApexOptions['series'];
  }>({
    options: {
      chart: {
        type: 'bar',
        fontFamily: 'Inter, sans-serif',
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true,
          },
        },
        background: 'transparent',
      },
      colors: ['hsl(160, 100%, 50%)', 'hsl(210, 100%, 50%)'],
      stroke: {
        curve: 'smooth',
        width: 3,
      },
      grid: {
        borderColor: 'hsl(220, 30%, 20%)',
        strokeDashArray: 5,
        xaxis: {
          lines: {
            show: true,
          },
        },
        yaxis: {
          lines: {
            show: true,
          },
        },
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
        name: 'Receitas',
        data: [31000, 40000, 35000, 50000, 49000, 60000, 70000, 91000, 85000, 94000, 80000, 100000],
      },
      {
        name: 'Despesas',
        data: [11000, 32000, 45000, 32000, 34000, 52000, 41000, 31000, 40000, 28000, 51000, 42000],
      },
    ],
  });

  useEffect(() => {
    generateReport();
  }, [reportType, dateRange]);

  const generateReport = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Aqui seria feita a chamada real à API para obter os dados do relatório
      // const response = await reportService.getReportData(reportType, dateRange, startDate, endDate);
      
      // Simulando um tempo de carregamento
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Atualizar os dados do gráfico com base no tipo de relatório
      if (reportType === 'financial') {
        setChartData({
          ...chartData,
          options: {
            ...chartData.options,
            chart: {
              ...chartData.options.chart,
              type: 'bar',
            },
            title: {
              text: 'Relatório Financeiro',
              align: 'left',
              style: {
                color: 'hsl(0, 0%, 80%)',
              },
            },
          },
          series: [
            {
              name: 'Receitas',
              data: [31000, 40000, 35000, 50000, 49000, 60000, 70000, 91000, 85000, 94000, 80000, 100000],
            },
            {
              name: 'Despesas',
              data: [11000, 32000, 45000, 32000, 34000, 52000, 41000, 31000, 40000, 28000, 51000, 42000],
            },
          ],
        });
      } else if (reportType === 'loans') {
        setChartData({
          ...chartData,
          options: {
            ...chartData.options,
            chart: {
              ...chartData.options.chart,
              type: 'line',
            },
            title: {
              text: 'Relatório de Empréstimos',
              align: 'left',
              style: {
                color: 'hsl(0, 0%, 80%)',
              },
            },
          },
          series: [
            {
              name: 'Empréstimos Aprovados',
              data: [5, 8, 12, 7, 9, 11, 13, 15, 10, 12, 14, 16],
            },
            {
              name: 'Empréstimos Pagos',
              data: [3, 5, 7, 6, 8, 7, 9, 11, 8, 9, 10, 12],
            },
          ],
        });
      } else if (reportType === 'members') {
        setChartData({
          ...chartData,
          options: {
            ...chartData.options,
            chart: {
              ...chartData.options.chart,
              type: 'area',
            },
            title: {
              text: 'Relatório de Sócios',
              align: 'left',
              style: {
                color: 'hsl(0, 0%, 80%)',
              },
            },
          },
          series: [
            {
              name: 'Sócios Ativos',
              data: [80, 85, 90, 95, 100, 105, 110, 115, 120, 125, 128, 130],
            },
            {
              name: 'Novos Sócios',
              data: [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 3, 2],
            },
          ],
        });
      }
    } catch (err) {
      console.error('Erro ao gerar relatório:', err);
      setError('Falha ao gerar relatório. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateRangeChange = (range: string) => {
    setDateRange(range);
    
    const today = new Date();
    let start = new Date();
    
    switch (range) {
      case 'week':
        start = new Date(today.setDate(today.getDate() - 7));
        break;
      case 'month':
        start = new Date(today.setMonth(today.getMonth() - 1));
        break;
      case 'quarter':
        start = new Date(today.setMonth(today.getMonth() - 3));
        break;
      case 'year':
        start = new Date(today.setFullYear(today.getFullYear() - 1));
        break;
      case 'custom':
        // Manter as datas personalizadas existentes
        return;
    }
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(new Date().toISOString().split('T')[0]);
  };

  const handleExportPDF = () => {
    // Aqui seria implementada a exportação para PDF
    // Poderia usar uma chamada à API para gerar o PDF no backend
    alert('Exportação para PDF será implementada em breve');
  };

  const handleExportExcel = () => {
    // Aqui seria implementada a exportação para Excel
    // Poderia usar uma biblioteca como xlsx para gerar o Excel no frontend
    alert('Exportação para Excel será implementada em breve');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-orbitron font-bold">Relatórios</h1>
        <p className="text-muted-foreground mt-1">Gere e visualize relatórios detalhados</p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive p-4 rounded-lg flex items-start space-x-3">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="glass rounded-xl border border-border p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                reportType === 'financial'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 hover:bg-muted/70 text-foreground'
              }`}
              onClick={() => setReportType('financial')}
            >
              <BarChart3 size={18} />
              <span>Financeiro</span>
            </button>
            <button
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                reportType === 'loans'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 hover:bg-muted/70 text-foreground'
              }`}
              onClick={() => setReportType('loans')}
            >
              <LineChart size={18} />
              <span>Empréstimos</span>
            </button>
            <button
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                reportType === 'members'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 hover:bg-muted/70 text-foreground'
              }`}
              onClick={() => setReportType('members')}
            >
              <PieChart size={18} />
              <span>Sócios</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <Calendar size={18} className="text-muted-foreground" />
            <select
              className="bg-muted/50 border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              value={dateRange}
              onChange={(e) => handleDateRangeChange(e.target.value)}
            >
              <option value="week">Última Semana</option>
              <option value="month">Último Mês</option>
              <option value="quarter">Último Trimestre</option>
              <option value="year">Último Ano</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>
        </div>

        {dateRange === 'custom' && (
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label htmlFor="startDate" className="block text-sm font-medium mb-1">
                Data Inicial
              </label>
              <input
                id="startDate"
                type="date"
                className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label htmlFor="endDate" className="block text-sm font-medium mb-1">
                Data Final
              </label>
              <input
                id="endDate"
                type="date"
                className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <button
                className="bg-primary hover:bg-primary/90 text-primary-foreground py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors"
                onClick={() => generateReport()}
              >
                <Filter size={18} />
                <span>Filtrar</span>
              </button>
            </div>
          </div>
        )}

        <div className="relative h-96">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10 rounded-lg">
              <div className="flex flex-col items-center">
                <RefreshCw size={32} className="text-primary animate-spin mb-2" />
                <span>Gerando relatório...</span>
              </div>
            </div>
          )}
          <ReactApexChart
            options={chartData.options}
            series={chartData.series}
            type={chartData.options.chart.type}
            height="100%"
          />
        </div>

        <div className="flex justify-end mt-6 space-x-3">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors"
            onClick={handleExportPDF}
          >
            <Download size={18} />
            <span>Exportar PDF</span>
          </button>
          <button
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors"
            onClick={handleExportExcel}
          >
            <Download size={18} />
            <span>Exportar Excel</span>
          </button>
        </div>
      </div>

      <div className="glass rounded-xl border border-border p-6">
        <h2 className="text-xl font-semibold mb-4">Relatórios Salvos</h2>
        <p className="text-muted-foreground mb-4">
          Acesse relatórios gerados anteriormente e salvos no sistema.
        </p>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/30">
                <th className="text-left py-3 px-4 font-medium">Nome</th>
                <th className="text-center py-3 px-4 font-medium">Tipo</th>
                <th className="text-center py-3 px-4 font-medium">Período</th>
                <th className="text-center py-3 px-4 font-medium">Data de Criação</th>
                <th className="text-right py-3 px-4 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} className="py-8 text-center text-muted-foreground">
                  Nenhum relatório salvo encontrado
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPanel;

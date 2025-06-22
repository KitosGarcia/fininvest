import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
} from 'chart.js';

// Registo dos módulos do gráfico
ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale);

// Exemplo de dados — substitui pelo teu fetch depois
const data = {
  labels: ['21/04', '22/04', '23/04', '24/04', '25/04'],
  datasets: [
    {
      label: 'Liquidez',
      data: [100, 100, 100, 24, 0],
      borderColor: '#00f0ff',
      tension: 0.4,
    },
  ],
};

export function Dashboard() {
  return (
    <div className="flex flex-col gap-6 p-6 bg-jarvis-bg min-h-full">
      <h2 className="text-2xl font-semibold text-jarvis-accent">Dashboard</h2>

      <div className="bg-jarvis-panel p-4 rounded shadow 
                      h-[calc(100vh-10rem)] max-h-[600px] overflow-auto">
        <Line data={data} />
      </div>
    </div>
  );
}

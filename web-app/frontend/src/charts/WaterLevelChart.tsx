import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import type { SensorHistory } from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    x: {
      ticks: { color: '#94a3b8', maxTicksLimit: 8 },
      grid: { color: 'rgba(255,255,255,0.05)' },
    },
    y: {
      ticks: { color: '#94a3b8' },
      grid: { color: 'rgba(255,255,255,0.05)' },
    },
  },
};

function formatLabels(data: SensorHistory[]) {
  return data.map((d) =>
    new Date(d.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  );
}

export function WaterLevelChart({ data }: { data: SensorHistory[] }) {
  const chartData = {
    labels: formatLabels(data),
    datasets: [
      {
        label: 'Niveau eau (%)',
        data: data.map((d) => d.water_level),
        borderColor: '#22d3ee',
        backgroundColor: 'rgba(34, 211, 238, 0.15)',
        fill: true,
        tension: 0.35,
      },
    ],
  };

  return (
    <div className="glass-card h-64">
      <h4 className="mb-2 font-display text-sm text-cyan-200">Historique niveau eau — 24h</h4>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
}

export function AiScoreChart({ data }: { data: SensorHistory[] }) {
  const chartData = {
    labels: formatLabels(data),
    datasets: [
      {
        label: 'Score IA',
        data: data.map((d) => d.risk_score),
        borderColor: '#a78bfa',
        backgroundColor: 'rgba(167, 139, 250, 0.15)',
        fill: true,
        tension: 0.35,
      },
    ],
  };

  return (
    <div className="glass-card h-64">
      <h4 className="mb-2 font-display text-sm text-violet-300">Historique score IA</h4>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
}

export function RainChart({ data }: { data: SensorHistory[] }) {
  const chartData = {
    labels: formatLabels(data),
    datasets: [
      {
        label: 'Pluie (mm/h)',
        data: data.map((d) => d.rainfall),
        borderColor: '#60a5fa',
        backgroundColor: 'rgba(96, 165, 250, 0.15)',
        fill: true,
        tension: 0.35,
      },
    ],
  };

  return (
    <div className="glass-card h-64">
      <h4 className="mb-2 font-display text-sm text-blue-300">Historique pluie</h4>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
}

export function FlowChart({ data }: { data: SensorHistory[] }) {
  const chartData = {
    labels: formatLabels(data),
    datasets: [
      {
        label: 'Débit (m³/s)',
        data: data.map((d) => d.flow_rate),
        borderColor: '#34d399',
        backgroundColor: 'rgba(52, 211, 153, 0.15)',
        fill: true,
        tension: 0.35,
      },
    ],
  };

  return (
    <div className="glass-card h-64">
      <h4 className="mb-2 font-display text-sm text-emerald-300">Historique débit</h4>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
}

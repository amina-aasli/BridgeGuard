import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api, type DashboardData, type SensorHistory } from '../services/api';
import { useRealtime } from '../hooks/useRealtime';
import MetricCard from '../components/MetricCard';
import SensorCard from '../components/SensorCard';
import SimulationPanel from '../components/SimulationPanel';
import BridgeMap from '../components/BridgeMap';
import SystemLoader from '../components/SystemLoader';
import { WaterLevelChart, AiScoreChart, RainChart, FlowChart } from '../charts/WaterLevelChart';

function statusFromValue(val: number, warn: number, danger: number): 'ok' | 'warn' | 'danger' | 'neutral' {
  if (val >= danger) return 'danger';
  if (val >= warn) return 'warn';
  return 'ok';
}

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [history, setHistory] = useState<SensorHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertActive, setAlertActive] = useState(false);

  const load = useCallback(async () => {
    try {
      const [dash, hist] = await Promise.all([api.getDashboard(), api.getHistory(24)]);
      setDashboard(dash);
      setHistory(hist);
      setAlertActive(dash.metrics.aiScore > 0.55 || dash.metrics.waterLevel > 70);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useRealtime(load, 3000);

  if (loading || !dashboard) return <SystemLoader label="Synchronisation capteurs..." />;

  const { metrics, sensors, location } = dashboard;
  const mpu = sensors.mpu6050 as { x: number; y: number; z: number };
  const hcsr = sensors.hcsr04 as { value: number; unit: string };
  const flow = sensors.flowmeter as { value: number; unit: string };
  const cam = sensors.camera as { status: string };
  const rain = sensors.rainGauge as { value: number; unit: string };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-display text-2xl font-bold text-white md:text-3xl">Dashboard surveillance</h1>
        <p className="text-slate-500">Lecture temps réel — Pont Oued Tensift</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-8">
        <MetricCard label="Niveau eau" value={metrics.waterLevel} unit="%" status={statusFromValue(metrics.waterLevel, 60, 85)} delay={0} />
        <MetricCard label="Débit" value={metrics.flowRate} unit="m³/s" status={statusFromValue(metrics.flowRate, 3, 4.5)} delay={0.05} />
        <MetricCard label="Pluviométrie" value={metrics.rainfall} unit="mm/h" delay={0.1} />
        <MetricCard label="Score IA" value={metrics.aiScore.toFixed(2)} status={statusFromValue(metrics.aiScore, 0.4, 0.7)} delay={0.15} />
        <MetricCard label="Raspberry Pi" value={metrics.raspberry} status={metrics.raspberry === 'online' ? 'ok' : 'danger'} delay={0.2} />
        <MetricCard label="Supabase" value={metrics.supabase} status="neutral" delay={0.25} />
        <MetricCard label="YOLO" value={metrics.yolo} status={metrics.yolo === 'running' ? 'ok' : 'warn'} delay={0.3} />
        <MetricCard label="Réseau 4G" value={metrics.network4g} status={metrics.network4g === 'connected' ? 'ok' : 'warn'} delay={0.35} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <SensorCard title="HC-SR04 Ultrason" icon="📡" delay={0.1}>
          <p className="text-2xl font-bold text-cyan-300">{hcsr.value?.toFixed?.(1) ?? hcsr.value} {hcsr.unit}</p>
        </SensorCard>
        <SensorCard title="MPU6050" icon="📳" delay={0.15}>
          <p className="text-sm text-slate-400">X: {mpu.x} · Y: {mpu.y} · Z: {mpu.z}</p>
        </SensorCard>
        <SensorCard title="Débitmètre" icon="💧" delay={0.2}>
          <p className="text-2xl font-bold text-emerald-300">{flow.value} {flow.unit}</p>
        </SensorCard>
        <SensorCard title="Caméra 5MP" icon="📷" delay={0.25}>
          <p className={`text-lg font-semibold ${cam.status === 'ok' ? 'text-emerald-400' : 'text-amber-400'}`}>{cam.status}</p>
        </SensorCard>
        <SensorCard title="Pluviomètre" icon="🌧️" delay={0.3}>
          <p className="text-2xl font-bold text-blue-300">{rain.value} {rain.unit}</p>
        </SensorCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <WaterLevelChart data={history} />
        <AiScoreChart data={history} />
        <RainChart data={history} />
        <FlowChart data={history} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <BridgeMap
          lat={location.lat}
          lng={location.lng}
          geofenceRadius={location.geofenceRadius}
          alertActive={alertActive}
        />
        <SimulationPanel onStarted={load} />
      </div>
    </div>
  );
}

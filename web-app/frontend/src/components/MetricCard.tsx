import { motion } from 'framer-motion';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  status?: 'ok' | 'warn' | 'danger' | 'neutral';
  delay?: number;
}

const statusColors = {
  ok: 'text-emerald-400',
  warn: 'text-amber-400',
  danger: 'text-red-400',
  neutral: 'text-cyan-300',
};

export default function MetricCard({
  label,
  value,
  unit,
  status = 'neutral',
  delay = 0,
}: MetricCardProps) {
  const isStatusLabel =
    typeof value === 'string' && /^(running|connected|local|online|offline|weak|ok|degraded)$/i.test(value);

  return (
    <motion.div
      className="glass-card flex flex-col items-center text-center"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>
      <p className={`metric-value ${isStatusLabel ? 'text-xl md:text-2xl' : 'text-2xl md:text-3xl'} ${statusColors[status]}`}>
        {value}
        {unit && <span className="ml-1 text-lg text-slate-500">{unit}</span>}
      </p>
    </motion.div>
  );
}

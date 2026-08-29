import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { api, type PublicStatus } from '../services/api';
import { useRealtime } from '../hooks/useRealtime';
import SystemLoader from '../components/SystemLoader';

const riskStyles: Record<string, { card: string; glow: string; label: string }> = {
  Faible: {
    card: 'from-emerald-600/30 to-emerald-900/20 border-emerald-500/50',
    glow: 'shadow-[0_0_40px_rgba(16,185,129,0.3)]',
    label: 'text-emerald-300',
  },
  Modéré: {
    card: 'from-amber-600/30 to-amber-900/20 border-amber-500/50',
    glow: 'shadow-[0_0_40px_rgba(245,158,11,0.3)]',
    label: 'text-amber-300',
  },
  Elevé: {
    card: 'from-red-600/30 to-red-900/20 border-red-500/50',
    glow: 'shadow-[0_0_40px_rgba(239,68,68,0.35)]',
    label: 'text-red-300',
  },
};

const bridgeStyles: Record<string, string> = {
  Accessible: 'text-emerald-400',
  Vigilance: 'text-amber-400',
  Fermé: 'text-red-400',
};

export default function PublicPage() {
  const [status, setStatus] = useState<PublicStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await api.getPublicStatus();
      setStatus(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useRealtime(load, 5000);

  if (loading || !status) return <SystemLoader label="Mise à jour du statut pont..." />;

  const style = riskStyles[status.riskLevel] || riskStyles.Faible;

  return (
    <div className="min-h-screen">
      <div className="border-b border-cyan-500/20 bg-cyan-950/30 px-4 py-3 text-center text-sm font-medium text-cyan-200">
        Pont surveillé automatiquement par BridgeGuard
      </div>

      <main className="mx-auto max-w-4xl px-4 py-10">
        <motion.header
          className="mb-10 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-4xl font-bold text-white md:text-5xl">BridgeGuard</h1>
          <p className="mt-2 text-lg text-slate-400">Pont Oued Tensift — Information publique</p>
        </motion.header>

        <div className="grid gap-6 md:grid-cols-3">
          <motion.div
            className={`col-span-full rounded-3xl border bg-gradient-to-br p-8 md:col-span-1 md:row-span-2 ${style.card} ${style.glow}`}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring' }}
          >
            <p className="text-sm uppercase tracking-widest text-slate-400">Niveau de risque</p>
            <p className={`mt-4 font-display text-5xl font-bold ${style.label}`}>{status.riskLevel}</p>
          </motion.div>

          <motion.div
            className="glass-card flex flex-col justify-center"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <p className="text-sm text-slate-500">État du pont</p>
            <p className={`mt-2 font-display text-3xl font-bold ${bridgeStyles[status.bridgeState] || 'text-white'}`}>
              {status.bridgeState}
            </p>
          </motion.div>

          <motion.div
            className="glass-card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-sm text-slate-500">Alerte active</p>
            <p className={`mt-2 text-2xl font-bold ${status.activeAlert ? 'text-red-400' : 'text-emerald-400'}`}>
              {status.activeAlert ? 'Oui' : 'Non'}
            </p>
          </motion.div>

          <motion.div
            className="glass-card md:col-span-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-sm text-slate-500">Dernière mise à jour</p>
            <p className="mt-2 text-xl text-cyan-200">
              {new Date(status.lastUpdate).toLocaleString('fr-FR')}
            </p>
          </motion.div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-3">
          {(['Faible', 'Modéré', 'Elevé'] as const).map((level) => (
            <div
              key={level}
              className={`h-3 rounded-full ${
                level === 'Faible'
                  ? 'bg-emerald-500'
                  : level === 'Modéré'
                    ? 'bg-amber-500'
                    : 'bg-red-500'
              } ${status.riskLevel === level ? 'ring-2 ring-white/50' : 'opacity-30'}`}
              title={level}
            />
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-slate-600">
          <Link to="/login" className="text-cyan-600/50 hover:text-cyan-500">
            Accès ingénieur
          </Link>
        </p>
      </main>
    </div>
  );
}

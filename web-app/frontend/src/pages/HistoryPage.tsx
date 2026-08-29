import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api, type AlertRow } from '../services/api';
import SystemLoader from '../components/SystemLoader';

type Filter = '24h' | '7d' | '30d';

const FILTERS: { key: Filter; label: string }[] = [
  { key: '24h', label: '24 h' },
  { key: '7d', label: '7 jours' },
  { key: '30d', label: '30 jours' },
];

export default function HistoryPage() {
  const [filter, setFilter] = useState<Filter>('24h');
  const [rows, setRows] = useState<AlertRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .getAlerts(filter)
      .then((r) => setRows(r.rows))
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold">Historique des alertes</h1>
        <p className="text-slate-500">Journal des événements système</p>
      </motion.div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              filter === f.key
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'border border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <SystemLoader />
      ) : (
        <motion.div
          className="glass-panel overflow-x-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase text-slate-500">
                <th className="p-4">Date</th>
                <th className="p-4">Type alerte</th>
                <th className="p-4">Score IA</th>
                <th className="p-4">Action déclenchée</th>
                <th className="p-4">État système</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4 text-slate-300">
                    {new Date(row.date).toLocaleString('fr-FR')}
                  </td>
                  <td className="p-4">{row.type}</td>
                  <td className="p-4 font-mono text-violet-300">{row.aiScore?.toFixed?.(2) ?? row.aiScore}</td>
                  <td className="p-4 text-slate-400">{row.action}</td>
                  <td className="p-4">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        row.systemState === 'fermé'
                          ? 'bg-red-500/20 text-red-300'
                          : row.systemState === 'vigilance'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {row.systemState}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
            <p className="p-8 text-center text-slate-500">Aucune alerte pour cette période</p>
          )}
        </motion.div>
      )}
    </div>
  );
}

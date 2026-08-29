import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { api } from '../services/api';

const EVENT_LABELS = [
  'Montée détectée',
  'Seuil vigilance',
  'SMS envoyé',
  'Passage en risque critique',
  'Barrière fermée',
  'Géofencing activé',
];

export default function SimulationPanel({ onStarted }: { onStarted: () => void }) {
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<string[]>([]);

  const handleSimulate = async () => {
    setLoading(true);
    setEvents([]);
    try {
      await api.startSimulation();
      toast.success('Simulation démarrée — injection Supabase');
      onStarted();

      let i = 0;
      const interval = setInterval(() => {
        if (i < EVENT_LABELS.length) {
          setEvents((prev) => [...prev, EVENT_LABELS[i]]);
          i += 1;
        } else {
          clearInterval(interval);
        }
      }, 3000);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erreur simulation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div className="glass-card border-amber-500/20" layout>
      <h3 className="font-display text-lg text-amber-300">Mode simulation</h3>
      <p className="mt-1 text-sm text-slate-400">
        Injecte uniquement des données simulées (aucune logique décisionnelle côté app).
      </p>
      <button
        type="button"
        disabled={loading}
        onClick={handleSimulate}
        className="mt-4 w-full rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-3 font-semibold text-white shadow-lg transition hover:from-amber-500 disabled:opacity-50 sm:w-auto"
      >
        {loading ? 'Injection en cours...' : "Simuler montée d'eau"}
      </button>
      <AnimatePresence>
        {events.length > 0 && (
          <motion.ul
            className="mt-4 space-y-2 border-t border-white/10 pt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {events.map((evt) => (
              <motion.li
                key={evt}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-sm text-amber-200"
              >
                <span className="status-dot bg-amber-400 animate-pulse" />
                {evt}
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

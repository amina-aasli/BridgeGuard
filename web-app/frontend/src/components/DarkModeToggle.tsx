import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function DarkModeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    document.body.classList.toggle('bg-slate-950', dark);
    document.body.classList.toggle('bg-slate-100', !dark);
    document.body.classList.toggle('text-slate-900', !dark);
  }, [dark]);

  return (
    <motion.button
      type="button"
      onClick={() => setDark((d) => !d)}
      className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-400 hover:text-cyan-300"
      whileTap={{ scale: 0.95 }}
      title="Basculer thème clair/sombre"
    >
      {dark ? '☀️ Clair' : '🌙 Sombre'}
    </motion.button>
  );
}

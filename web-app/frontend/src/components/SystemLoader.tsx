import { motion } from 'framer-motion';

export default function SystemLoader({ label = 'Chargement des données...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <motion.div
        className="h-14 w-14 rounded-full border-2 border-cyan-500/30 border-t-cyan-400"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
      />
      <p className="font-display text-sm tracking-widest text-cyan-400/80">{label}</p>
    </div>
  );
}

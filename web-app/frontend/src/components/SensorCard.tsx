import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface SensorCardProps {
  title: string;
  icon: string;
  children: ReactNode;
  delay?: number;
}

export default function SensorCard({ title, icon, children, delay = 0 }: SensorCardProps) {
  return (
    <motion.div
      className="glass-card"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
    >
      <motion.div className="mb-3 flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        <h3 className="font-display text-sm font-semibold text-cyan-200">{title}</h3>
      </motion.div>
      {children}
    </motion.div>
  );
}

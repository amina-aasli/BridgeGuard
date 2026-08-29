import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel max-w-md p-10"
      >
        <p className="font-display text-6xl font-bold text-cyan-500/50">404</p>
        <h1 className="mt-4 font-display text-xl text-white">Page introuvable</h1>
        <p className="mt-2 text-slate-400">La ressource demandée n&apos;existe pas.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/"
            className="rounded-xl bg-cyan-600/80 px-6 py-2 font-semibold text-white hover:bg-cyan-500"
          >
            Accueil public
          </Link>
          <Link
            to="/login"
            className="rounded-xl border border-white/20 px-6 py-2 text-slate-300 hover:bg-white/5"
          >
            Connexion ingénieur
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

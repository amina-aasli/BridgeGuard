import { Link, NavLink, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import DarkModeToggle from '../components/DarkModeToggle';

export default function EngineerLayout() {
  const { email, logout } = useAuth();

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2 rounded-lg text-sm font-semibold transition ${
      isActive
        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
        : 'text-slate-400 hover:text-cyan-200'
    }`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen"
    >
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <motion.div
          className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
        >
          <Link to="/engineer" className="font-display text-xl font-bold text-cyan-400">
            BridgeGuard
            <span className="ml-2 text-xs font-normal text-slate-500">Ingénieur</span>
          </Link>
          <nav className="flex flex-wrap gap-2">
            <NavLink to="/engineer" end className={navClass}>
              Dashboard
            </NavLink>
            <NavLink to="/engineer/history" className={navClass}>
              Historique
            </NavLink>
          </nav>
          <motion.div className="flex items-center gap-3 text-sm">
            <DarkModeToggle />
            <span className="hidden text-slate-500 sm:inline">{email}</span>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-red-500/30 px-3 py-1.5 text-red-300 hover:bg-red-500/10"
            >
              Déconnexion
            </button>
          </motion.div>
        </motion.div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </motion.div>
  );
}

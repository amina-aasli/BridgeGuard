import { FormEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [connecting, setConnecting] = useState(false);

  if (!loading && isAuthenticated) {
    return <Navigate to="/engineer" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setConnecting(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      await login(email, password);
      toast.success('Connexion réussie');
      navigate('/engineer');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Échec connexion');
      setConnecting(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <motion.div
        className="glass-panel w-full max-w-md p-8"
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 120 }}
      >
        <motion.div
          className="mb-8 text-center"
          animate={connecting ? { scale: [1, 1.02, 1] } : {}}
          transition={{ repeat: connecting ? Infinity : 0, duration: 1.2 }}
        >
          <h1 className="font-display text-3xl font-bold text-cyan-400">BridgeGuard</h1>
          <p className="mt-2 text-sm text-slate-400">Espace ingénieur sécurisé</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-1 block text-xs uppercase text-slate-500">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none focus:border-cyan-500/50"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-xs uppercase text-slate-500">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none focus:border-cyan-500/50"
            />
          </div>
          <motion.button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 py-3 font-semibold text-white shadow-glow disabled:opacity-60"
            whileTap={{ scale: 0.98 }}
          >
            {submitting ? 'Connexion...' : 'Se connecter'}
          </motion.button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-600">
          Accès réservé aux ingénieurs autorisés
        </p>
        <a href="/" className="mt-4 block text-center text-sm text-cyan-500/70 hover:text-cyan-400">
          Interface publique
        </a>
      </motion.div>
    </div>
  );
}

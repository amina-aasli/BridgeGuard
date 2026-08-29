import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api } from '../services/api';

interface AuthContextValue {
  token: string | null;
  email: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('bg_token'));
  const [email, setEmail] = useState<string | null>(() => localStorage.getItem('bg_email'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .me()
      .then((r) => {
        setEmail(r.user.email);
        localStorage.setItem('bg_email', r.user.email);
      })
      .catch(() => {
        localStorage.removeItem('bg_token');
        localStorage.removeItem('bg_email');
        setToken(null);
        setEmail(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = useCallback(async (userEmail: string, password: string) => {
    const res = await api.login(userEmail.trim().toLowerCase(), password);
    localStorage.setItem('bg_token', res.token);
    localStorage.setItem('bg_email', res.user.email);
    setToken(res.token);
    setEmail(res.user.email);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('bg_token');
    localStorage.removeItem('bg_email');
    setToken(null);
    setEmail(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      email,
      loading,
      login,
      logout,
      isAuthenticated: Boolean(token),
    }),
    [token, email, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import SystemLoader from './SystemLoader';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <SystemLoader label="Vérification session..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

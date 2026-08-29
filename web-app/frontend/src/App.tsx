import { Routes, Route } from 'react-router-dom';
import EngineerLayout from './layout/EngineerLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import HistoryPage from './pages/HistoryPage';
import PublicPage from './pages/PublicPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/engineer"
        element={
          <ProtectedRoute>
            <EngineerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="history" element={<HistoryPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

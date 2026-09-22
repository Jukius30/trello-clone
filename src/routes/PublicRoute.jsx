import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PublicRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Memuat sesi...
      </div>
    );
  }

  // Jika sudah login, lempar langsung ke board/dashboard
  return !user ? <Outlet /> : <Navigate to="/dashboard" replace />;
}
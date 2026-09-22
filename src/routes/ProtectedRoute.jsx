import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Memuat sesi...
      </div>
    );
  }

  // Jika belum login, redirect ke halaman login
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
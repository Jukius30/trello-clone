import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';
import AuthPage from './components/AuthPage';
import BoardPage from './pages/BoardPage'; // Komponen tampilan kanban board utama

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rute Publik: Hanya bisa dibuka jika belum login */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<AuthPage />} />
          </Route>

          {/* Rute Terproteksi: Wajib login untuk akses */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<BoardPage />} />
            {/* Dukungan URL dinamis per project jika diperlukan: /project/:projectId */}
            <Route path="/project/:projectId" element={<BoardPage />} />
          </Route>

          {/* Fallback Redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
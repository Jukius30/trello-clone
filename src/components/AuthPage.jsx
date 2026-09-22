// src/components/AuthPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabase';

export default function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (isLogin) {
        // Mode Login
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;
        navigate('/dashboard');
      } else {
        // Mode Register
        const { error, data } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        if (data?.session) {
          navigate('/dashboard');
        } else {
          setSuccessMessage(
            'Registrasi berhasil! Cek email Anda untuk konfirmasi aktivasi akun, atau langsung coba login.'
          );
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat otentikasi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center p-3 position-relative overflow-hidden"
      style={{ backgroundColor: 'var(--bg-main, #090a0f)' }}
    >
      {/* Background Radial Glow Effect */}
      <div
        className="position-absolute top-50 start-50 translate-middle rounded-circle pointer-events-none"
        style={{
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, rgba(9, 10, 15, 0) 70%)',
          filter: 'blur(40px)',
          zIndex: 0,
        }}
      ></div>

      <div className="w-100 position-relative" style={{ maxWidth: '400px', zIndex: 1 }}>
        {/* Logo & Headline */}
        <div className="text-center mb-4">
          <div
            className="bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-3 d-inline-flex align-items-center justify-content-center mb-2.5 shadow-sm"
            style={{ width: '44px', height: '44px' }}
          >
            <i className="bi bi-kanban-fill fs-5"></i>
          </div>
          <h4 className="fw-bold text-white mb-1 tracking-wide">
            Trello<span className="text-primary">Clone</span>
          </h4>
          <p className="task-desc small mb-0">
            {isLogin
              ? 'Masuk ke akun untuk melanjutkan pekerjaan tim'
              : 'Daftar akun baru dan kelola project Anda'}
          </p>
        </div>

        {/* Card Form */}
        <div className="kanban-column-card p-4 shadow-lg">
          {/* Toggle Tab Login / Register */}
          <div
            className="d-flex p-1 rounded-2 mb-3.5"
            style={{ backgroundColor: '#0d0f14', border: '1px solid var(--border-subtle, #242938)' }}
          >
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`btn btn-sm flex-grow-1 border-0 py-1.5 fw-medium rounded-2 transition-all ${
                isLogin
                  ? 'btn-primary text-white shadow-sm'
                  : 'text-secondary bg-transparent'
              }`}
              style={{ fontSize: '13px' }}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`btn btn-sm flex-grow-1 border-0 py-1.5 fw-medium rounded-2 transition-all ${
                !isLogin
                  ? 'btn-primary text-white shadow-sm'
                  : 'text-secondary bg-transparent'
              }`}
              style={{ fontSize: '13px' }}
            >
              Daftar Baru
            </button>
          </div>

          {/* Alert Error / Success */}
          {errorMessage && (
            <div
              className="alert bg-danger bg-opacity-10 border border-danger border-opacity-25 text-danger py-2 px-3 small rounded-2 mb-3 d-flex align-items-center gap-2"
              role="alert"
            >
              <i className="bi bi-exclamation-circle-fill flex-shrink-0"></i>
              <div style={{ fontSize: '12px' }}>{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div
              className="alert bg-success bg-opacity-10 border border-success border-opacity-25 text-success py-2 px-3 small rounded-2 mb-3 d-flex align-items-center gap-2"
              role="alert"
            >
              <i className="bi bi-check-circle-fill flex-shrink-0"></i>
              <div style={{ fontSize: '12px' }}>{successMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small text-secondary mb-1 fw-medium">Email</label>
              <div className="input-group input-group-sm">
                <span className="input-group-text modern-input border-end-0 text-secondary pe-2">
                  <i className="bi bi-envelope"></i>
                </span>
                <input
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-control modern-input border-start-0 ps-1"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label small text-secondary mb-1 fw-medium">Password</label>
              <div className="input-group input-group-sm">
                <span className="input-group-text modern-input border-end-0 text-secondary pe-2">
                  <i className="bi bi-lock"></i>
                </span>
                <input
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-control modern-input border-start-0 ps-1"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-sm w-100 py-2 rounded-2 fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-sm"
            >
              {loading && (
                <div
                  className="spinner-border spinner-border-sm text-white"
                  role="status"
                  style={{ width: '14px', height: '14px' }}
                ></div>
              )}
              <span>{isLogin ? 'Masuk ke Dashboard' : 'Buat Akun Sekarang'}</span>
            </button>
          </form>
        </div>

        {/* Footer Text */}
        <p className="text-center text-secondary small mt-4 opacity-50" style={{ fontSize: '11px' }}>
          TrelloClone &bull; Workspace Collaboration Platform
        </p>
      </div>
    </div>
  );
}
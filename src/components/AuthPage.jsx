// src/components/AuthPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/AuthService';
import { AuthController } from '../controllers/AuthController';

const authController = new AuthController(authService);

export default function AuthPage() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      if (isRegister) {
        await authController.handleRegister(formData);
      } else {
        await authController.handleLogin(formData);
      }
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-black p-3">
      <div className="card bg-dark border-secondary shadow-lg text-light" style={{ width: '100%', maxWidth: '420px' }}>
        <div className="card-body p-4">
          {/* Header */}
          <div className="text-center mb-4">
            <div className="d-inline-flex p-3 rounded-circle bg-primary bg-opacity-10 text-primary mb-2">
              <i className="bi bi-kanban-fill fs-3"></i>
            </div>
            <h4 className="fw-bold text-white mb-1">
              {isRegister ? 'Buat Akun Baru' : 'Selamat Datang'}
            </h4>
            <p className="text-secondary small mb-0">
              {isRegister
                ? 'Daftar untuk membuat dan mengelola project Anda'
                : 'Masuk ke akun untuk mengakses board kerja Anda'}
            </p>
          </div>

          {/* Notifikasi Error */}
          {errorMessage && (
            <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 small border-0 mb-3" role="alert">
              <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
              <div>{errorMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
            {isRegister && (
              <div>
                <label className="form-label text-secondary small mb-1">Nama Lengkap</label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-black border-secondary text-secondary">
                    <i className="bi bi-person"></i>
                  </span>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="form-control bg-black border-secondary text-white shadow-none"
                    required={isRegister}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="form-label text-secondary small mb-1">Email</label>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-black border-secondary text-secondary">
                  <i className="bi bi-envelope"></i>
                </span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="nama@email.com"
                  className="form-control bg-black border-secondary text-white shadow-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="form-label text-secondary small mb-1">Password</label>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-black border-secondary text-secondary">
                  <i className="bi bi-lock"></i>
                </span>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimal 6 karakter"
                  className="form-control bg-black border-secondary text-white shadow-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary btn-sm w-100 d-flex align-items-center justify-content-center gap-2 mt-2 py-2 fw-semibold"
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <span>Memproses...</span>
                </>
              ) : isRegister ? (
                <>
                  <i className="bi bi-person-plus-fill"></i>
                  <span>Daftar Akun</span>
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right"></i>
                  <span>Masuk</span>
                </>
              )}
            </button>
          </form>

          {/* Switcher Mode Login / Register */}
          <div className="text-center mt-4 small text-secondary">
            {isRegister ? 'Sudah memiliki akun?' : 'Belum memiliki akun?'}{' '}
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setErrorMessage('');
              }}
              className="btn btn-link p-0 text-primary small text-decoration-none fw-semibold ms-1"
            >
              {isRegister ? 'Masuk sekarang' : 'Daftar sekarang'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
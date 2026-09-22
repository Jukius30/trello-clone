// src/components/Navbar.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Navbar({
  projects,
  currentProject,
  onSelectProject,
  onOpenNewProject,
  onOpenJoinProject,
  onLeaveProject,
  onDeleteProject,
  user,
  onLogout,
  searchQuery,
  onSearchChange,
}) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const isOwner = currentProject?.user_id === user?.id;

  const copyProjectCode = () => {
    if (!currentProject?.code) return;
    navigator.clipboard.writeText(currentProject.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleActionProject = () => {
    if (isOwner) {
      if (
        window.confirm(
          `Hapus project "${currentProject.title}" secara permanen? Seluruh task di dalamnya akan hilang.`
        )
      ) {
        onDeleteProject(currentProject.id);
        navigate('/dashboard');
      }
    } else {
      if (window.confirm(`Keluar dari project "${currentProject.title}"?`)) {
        onLeaveProject(currentProject.id);
        navigate('/dashboard');
      }
    }
  };

  return (
    <nav className="navbar navbar-expand app-navbar px-3 py-2 sticky-top">
      <div className="container-fluid gap-2 px-1">
        {/* KIRI: Logo & Navigasi Kembali */}
        <div className="d-flex align-items-center gap-2">
          <div className="d-flex align-items-center gap-2 me-1">
            <div
              className="bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-3 d-flex align-items-center justify-content-center"
              style={{ width: '32px', height: '32px' }}
            >
              <i className="bi bi-kanban-fill fs-6"></i>
            </div>
            <span className="fw-bold text-white fs-6 d-none d-sm-inline tracking-wide">
              Trello<span className="text-primary">Clone</span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="btn btn-outline-secondary modern-input btn-sm d-flex align-items-center gap-1.5 py-1 px-2.5"
            title="Daftar Semua Board"
          >
            <i className="bi bi-arrow-left text-light opacity-75"></i>
            <span className="text-light small fw-medium">Semua Board</span>
          </button>
        </div>

        {/* TENGAH: Manajemen Project */}
        <div className="d-flex align-items-center gap-2 flex-wrap justify-content-center flex-grow-1">
          {projects.length > 0 ? (
            <select
              value={currentProject?.id || ''}
              onChange={(e) => {
                const target = projects.find((p) => p.id === e.target.value);
                if (target) {
                  onSelectProject(target);
                  navigate(`/board/${target.id}`);
                }
              }}
              className="form-select form-select-sm modern-input py-1 px-2.5 fw-medium text-white"
              style={{ width: 'auto', minWidth: '150px' }}
            >
              {projects.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title} {item.user_id === user?.id ? '★' : ''}
                </option>
              ))}
            </select>
          ) : (
            <small className="text-secondary fst-italic">Belum ada workspace</small>
          )}

          {/* Salin Kode Project */}
          {currentProject && (
            <button
              type="button"
              onClick={copyProjectCode}
              className="btn btn-outline-secondary modern-input btn-sm d-flex align-items-center gap-1.5 py-1 px-2.5"
              title="Salin Kode Undangan"
            >
              <i className={copied ? 'bi bi-check2 text-success' : 'bi bi-copy text-info'}></i>
              <span className="font-monospace text-info small fw-semibold">
                {currentProject.code || 'CODE'}
              </span>
              <span className="text-secondary small d-none d-lg-inline" style={{ fontSize: '11px' }}>
                {copied ? 'Tersalin' : 'Salin'}
              </span>
            </button>
          )}

          {/* Tombol Buat & Join */}
          <button
            type="button"
            onClick={onOpenNewProject}
            className="btn btn-primary btn-sm d-flex align-items-center gap-1 py-1 px-2.5 rounded-2"
          >
            <i className="bi bi-plus-lg"></i>
            <span className="d-none d-sm-inline small fw-medium">Baru</span>
          </button>

          <button
            type="button"
            onClick={onOpenJoinProject}
            className="btn btn-outline-info modern-input btn-sm d-flex align-items-center gap-1 py-1 px-2.5 rounded-2"
          >
            <i className="bi bi-box-arrow-in-down-right"></i>
            <span className="d-none d-sm-inline small fw-medium">Gabung</span>
          </button>

          {/* Hapus / Leave */}
          {currentProject && (
            <button
              type="button"
              onClick={handleActionProject}
              className={`btn btn-sm py-1 px-2 rounded-2 ${
                isOwner
                  ? 'btn-outline-danger border-0 opacity-75 hover-opacity-100'
                  : 'btn-outline-warning border-0 opacity-75 hover-opacity-100'
              }`}
              title={isOwner ? 'Hapus Project Permanen' : 'Keluar Project'}
            >
              <i className={isOwner ? 'bi bi-trash3' : 'bi bi-box-arrow-left'}></i>
            </button>
          )}
        </div>

        {/* KANAN: Pencarian Task & User Info */}
        <div className="d-flex align-items-center gap-2.5 ms-auto">
          <div className="input-group input-group-sm d-none d-xl-flex" style={{ width: '160px' }}>
            <span className="input-group-text modern-input border-end-0 text-secondary pe-1">
              <i className="bi bi-search" style={{ fontSize: '12px' }}></i>
            </span>
            <input
              type="text"
              placeholder="Cari task..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="form-control modern-input border-start-0 ps-1"
            />
          </div>

          <div className="d-flex align-items-center gap-2 border-start border-secondary border-opacity-25 ps-2.5">
            <div
              className="rounded-circle bg-gradient bg-primary text-white d-flex align-items-center justify-content-center fw-bold shadow-sm"
              style={{ width: '32px', height: '32px', fontSize: '12px' }}
              title={user?.email}
            >
              {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="btn btn-outline-danger border-0 btn-sm p-1.5 opacity-75 hover-opacity-100"
              title="Keluar Akun"
            >
              <i className="bi bi-box-arrow-right fs-6"></i>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
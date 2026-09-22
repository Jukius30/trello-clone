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
          `Apakah Anda yakin ingin MENGHAPUS project "${currentProject.title}" secara permanen? Semua task dan kolom akan ikut terhapus.`
        )
      ) {
        onDeleteProject(currentProject.id);
        navigate('/dashboard');
      }
    } else {
      if (
        window.confirm(
          `Apakah Anda yakin ingin KELUAR dari project "${currentProject.title}"?`
        )
      ) {
        onLeaveProject(currentProject.id);
        navigate('/dashboard');
      }
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark border-bottom border-secondary px-3 py-2">
      <div className="container-fluid gap-3">
        
        {/* KIRI: Logo Terlebih Dahulu, Lalu Tombol "Semua Board" Berwarna Putih */}
        <div className="d-flex align-items-center gap-2">
          <div className="d-flex align-items-center gap-2 me-1">
            <i className="bi bi-kanban-fill text-primary fs-4"></i>
            <span className="fw-bold text-white fs-6 d-none d-sm-inline">TrelloClone</span>
          </div>

          {/* Tombol Semua Board: Teks Putih Terang */}
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="btn btn-outline-secondary text-white btn-sm d-flex align-items-center gap-1 border-secondary"
            title="Kembali ke Daftar Board"
          >
            <i className="bi bi-arrow-left text-white"></i>
            <span className="text-white">Semua Board</span>
          </button>
        </div>

        {/* TENGAH: Selector Project & Tombol Aksi */}
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
              className="form-select form-select-sm bg-dark text-white border-secondary"
              style={{ width: 'auto', maxWidth: '200px' }}
            >
              {projects.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title} {item.user_id === user?.id ? '(Owner)' : '(Member)'}
                </option>
              ))}
            </select>
          ) : (
            <small className="text-secondary fst-italic">Belum ada project</small>
          )}

          {/* Salin Kode Project */}
          {currentProject && (
            <button
              type="button"
              onClick={copyProjectCode}
              className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
              title="Salin Kode Project"
            >
              <i className={copied ? 'bi bi-check2 text-success' : 'bi bi-copy'}></i>
              <span className="font-monospace fw-bold text-info">
                {currentProject.code || 'CODE'}
              </span>
              <small className="text-secondary d-none d-lg-inline">
                {copied ? '(Tersalin!)' : '(Salin)'}
              </small>
            </button>
          )}

          {/* Buat Project Baru */}
          <button
            type="button"
            onClick={onOpenNewProject}
            className="btn btn-primary btn-sm d-flex align-items-center gap-1"
          >
            <i className="bi bi-folder-plus"></i>
            <span className="d-none d-sm-inline">+ Baru</span>
          </button>

          {/* Gabung Project */}
          <button
            type="button"
            onClick={onOpenJoinProject}
            className="btn btn-outline-info btn-sm d-flex align-items-center gap-1"
          >
            <i className="bi bi-box-arrow-in-down-right"></i>
            <span className="d-none d-sm-inline">Gabung</span>
          </button>

          {/* Hapus / Leave Project */}
          {currentProject && (
            <button
              type="button"
              onClick={handleActionProject}
              className={`btn btn-sm d-flex align-items-center gap-1 ${
                isOwner ? 'btn-outline-danger' : 'btn-outline-warning'
              }`}
              title={isOwner ? 'Hapus Project Permanen' : 'Keluar dari Project'}
            >
              <i className={isOwner ? 'bi bi-trash3' : 'bi bi-box-arrow-left'}></i>
              <span className="d-none d-md-inline">
                {isOwner ? 'Hapus Project' : 'Leave Project'}
              </span>
            </button>
          )}
        </div>

        {/* KANAN: Pencarian Task, Profil & Tombol Keluar */}
        <div className="d-flex align-items-center gap-3">
          <div className="input-group input-group-sm d-none d-xl-flex" style={{ width: '160px' }}>
            <span className="input-group-text bg-dark border-secondary text-secondary">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              placeholder="Cari task..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="form-control bg-dark border-secondary text-white"
            />
          </div>

          <div className="d-flex align-items-center gap-2 border-start border-secondary ps-3">
            <div
              className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold"
              style={{ width: '32px', height: '32px', fontSize: '13px' }}
              title={user?.email}
            >
              {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
            </div>
            
            <button
              type="button"
              onClick={onLogout}
              className="btn btn-outline-danger btn-sm py-1 px-2 d-flex align-items-center gap-1"
              title="Keluar Akun"
            >
              <i className="bi bi-box-arrow-right"></i>
              <span className="d-none d-xxl-inline">Keluar</span>
            </button>
          </div>
        </div>

      </div>
    </nav>
  );
}
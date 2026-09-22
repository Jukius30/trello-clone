// src/pages/ProjectsPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBoard } from '../hooks/useBoard';

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    projects,
    loading,
    createProject,
    joinProject,
    leaveProject,
    deleteProject,
  } = useBoard();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Buat Project Baru
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    try {
      await createProject(newProjectName.trim());
      setNewProjectName('');
      setShowCreateModal(false);
    } catch (err) {
      console.error('Gagal membuat project:', err);
    }
  };

  // Gabung Project via Kode
  const handleJoin = async (e) => {
    e.preventDefault();
    setJoinError('');
    if (!joinCode.trim()) return;
    try {
      await joinProject(joinCode.trim());
      setJoinCode('');
      setShowJoinModal(false);
    } catch (err) {
      setJoinError(err.message);
    }
  };

  // Salin Kode Project
  const handleCopyCode = (code, projId) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedId(projId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Handler Hapus / Keluar Project dengan window.confirm yang valid
  const handleActionProject = async (proj, isOwner) => {
    if (isOwner) {
      const isConfirmed = window.confirm(
        `Apakah Anda yakin ingin MENGHAPUS board "${proj.title}" secara permanen? Semua task dan data di dalamnya akan ikut terhapus.`
      );
      if (!isConfirmed) return;

      try {
        await deleteProject(proj.id);
      } catch (err) {
        alert('Gagal menghapus project: ' + err.message);
      }
    } else {
      const isConfirmed = window.confirm(
        `Apakah Anda yakin ingin KELUAR dari board "${proj.title}"?`
      );
      if (!isConfirmed) return;

      try {
        await leaveProject(proj.id);
      } catch (err) {
        alert('Gagal keluar dari project: ' + err.message);
      }
    }
  };

  return (
    <div className="min-vh-100 bg-black text-light d-flex flex-column">
      {/* Header / Navbar */}
      <header className="navbar navbar-dark bg-dark border-bottom border-secondary px-4 py-2">
        <div className="container-fluid">
          <span className="navbar-brand d-flex align-items-center gap-2 fw-bold text-white mb-0">
            <i className="bi bi-kanban-fill text-primary fs-5"></i>
            TrelloClone
          </span>
          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center gap-2">
              <div
                className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold"
                style={{ width: '32px', height: '32px', fontSize: '13px' }}
              >
                {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="text-secondary small d-none d-sm-inline">{user?.email}</span>
            </div>
            <button
              type="button"
              onClick={logout}
              className="btn btn-outline-danger btn-sm py-1 px-2"
              title="Keluar"
            >
              <i className="bi bi-box-arrow-right"></i>
            </button>
          </div>
        </div>
      </header>

      {/* Konten Utama */}
      <main className="container py-5 flex-grow-1">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 pb-4 mb-4 border-bottom border-secondary">
          <div>
            <h3 className="fw-bold text-white mb-1">Daftar Workspace & Board</h3>
            <p className="text-secondary small mb-0">
              Pilih board yang ingin dikerjakan atau buat ruang kerja baru bersama tim.
            </p>
          </div>
          <div className="d-flex gap-2">
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary btn-sm d-flex align-items-center gap-1.5 px-3 py-2"
            >
              <i className="bi bi-plus-circle"></i>
              <span>Buat Board Baru</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setJoinError('');
                setShowJoinModal(true);
              }}
              className="btn btn-outline-info btn-sm d-flex align-items-center gap-1.5 px-3 py-2"
            >
              <i className="bi bi-box-arrow-in-down-right"></i>
              <span>Gabung Kode</span>
            </button>
          </div>
        </div>

        {/* List Grid Boards */}
        {loading ? (
          <div className="d-flex justify-content-center align-items-center py-5 text-secondary">
            <div className="spinner-border spinner-border-sm me-2 text-primary"></div>
            <span>Memuat daftar board...</span>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-5 my-4">
            <div className="card bg-dark border-secondary p-5 mx-auto shadow" style={{ maxWidth: '420px' }}>
              <i className="bi bi-layout-three-columns fs-1 text-secondary mb-3"></i>
              <h5 className="fw-bold text-white">Belum Ada Board</h5>
              <p className="text-secondary small mb-4">
                Anda belum memiliki atau tergabung dalam board mana pun. Mulai buat board pertama atau gunakan kode undangan teman.
              </p>
              <div className="d-flex justify-content-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="btn btn-primary btn-sm"
                >
                  + Buat Board
                </button>
                <button
                  type="button"
                  onClick={() => setShowJoinModal(true)}
                  className="btn btn-outline-info btn-sm"
                >
                  Gabung Kode
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {projects.map((proj) => {
              const isOwner = proj.user_id === user?.id;

              return (
                <div key={proj.id} className="col-12 col-md-6 col-lg-4">
                  <div className="card bg-dark border-secondary h-100 shadow-sm d-flex flex-column">
                    <div className="card-body p-4 d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <span
                          className={`badge ${
                            isOwner ? 'bg-primary' : 'bg-info text-dark'
                          } text-uppercase`}
                          style={{ fontSize: '10px' }}
                        >
                          {isOwner ? 'Owner' : 'Member'}
                        </span>

                        {/* Tombol Salin Kode */}
                        <button
                          type="button"
                          onClick={() => handleCopyCode(proj.code, proj.id)}
                          className="btn btn-outline-secondary btn-sm py-0 px-2"
                          style={{ fontSize: '11px' }}
                          title="Salin Kode Undangan"
                        >
                          <i className={copiedId === proj.id ? 'bi bi-check2 text-success' : 'bi bi-copy'}></i>{' '}
                          <span className="font-monospace text-info">{proj.code || 'CODE'}</span>
                        </button>
                      </div>

                      <h5 className="card-title text-white fw-bold mb-2">{proj.title}</h5>
                      <p className="card-text text-secondary small flex-grow-1">
                        Dibuat pada {new Date(proj.created_at).toLocaleDateString('id-ID')}
                      </p>

                      {/* Tombol Buka & Tombol Keluar/Hapus */}
                      <div className="d-flex gap-2 pt-3 border-top border-secondary mt-3">
                        <button
                          type="button"
                          onClick={() => navigate(`/board/${proj.id}`)}
                          className="btn btn-primary btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-1"
                        >
                          <i className="bi bi-kanban"></i>
                          <span>Buka Board</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleActionProject(proj, isOwner)}
                          className={`btn btn-sm ${
                            isOwner ? 'btn-outline-danger' : 'btn-outline-warning'
                          }`}
                          title={isOwner ? 'Hapus Board Permanen' : 'Keluar dari Board'}
                        >
                          <i className={isOwner ? 'bi bi-trash3' : 'bi bi-box-arrow-left'}></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal Buat Board Baru */}
      {showCreateModal && (
        <div className="modal d-block bg-black bg-opacity-75" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content bg-dark border-secondary text-light">
              <div className="modal-header border-secondary py-2">
                <h6 className="modal-title">Buat Board Baru</h6>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowCreateModal(false)}
                ></button>
              </div>
              <form onSubmit={handleCreate}>
                <div className="modal-body">
                  <label className="form-label small text-secondary">Nama Board / Project</label>
                  <input
                    type="text"
                    placeholder="Contoh: Skripsi App, Mobile UI"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="form-control form-control-sm bg-black border-secondary text-white"
                    autoFocus
                  />
                </div>
                <div className="modal-footer border-secondary py-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn btn-secondary btn-sm"
                  >
                    Batal
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm">
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Gabung Kode */}
      {showJoinModal && (
        <div className="modal d-block bg-black bg-opacity-75" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content bg-dark border-secondary text-light">
              <div className="modal-header border-secondary py-2">
                <h6 className="modal-title">Gabung ke Board Teman</h6>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowJoinModal(false)}
                ></button>
              </div>
              <form onSubmit={handleJoin}>
                <div className="modal-body">
                  {joinError && (
                    <div className="alert alert-danger py-1 px-2 small mb-2">{joinError}</div>
                  )}
                  <label className="form-label small text-secondary">Masukkan Kode (6 Karakter)</label>
                  <input
                    type="text"
                    placeholder="Contoh: 7K9M2X"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    className="form-control form-control-sm bg-black border-secondary text-white font-monospace text-center fs-6 tracking-wider"
                    autoFocus
                  />
                </div>
                <div className="modal-footer border-secondary py-2">
                  <button
                    type="button"
                    onClick={() => setShowJoinModal(false)}
                    className="btn btn-secondary btn-sm"
                  >
                    Batal
                  </button>
                  <button type="submit" className="btn btn-info btn-sm text-dark fw-semibold">
                    Gabung
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
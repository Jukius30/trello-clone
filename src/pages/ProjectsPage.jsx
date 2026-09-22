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

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    try {
      const created = await createProject(newProjectName.trim());
      setNewProjectName('');
      setShowCreateModal(false);
      if (created) navigate(`/board/${created.id}`);
    } catch (err) {
      console.error('Gagal membuat project:', err);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setJoinError('');
    if (!joinCode.trim()) return;
    try {
      const joined = await joinProject(joinCode.trim());
      setJoinCode('');
      setShowJoinModal(false);
      if (joined) navigate(`/board/${joined.id}`);
    } catch (err) {
      setJoinError(err.message);
    }
  };

  const handleCopyCode = (code, projId) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedId(projId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleActionProject = async (proj, isOwner) => {
    if (isOwner) {
      const ok = window.confirm(
        `Hapus board "${proj.title}" permanen? Semua task dan data di dalamnya akan terhapus.`
      );
      if (!ok) return;
      try {
        await deleteProject(proj.id);
      } catch (err) {
        alert('Gagal menghapus: ' + err.message);
      }
    } else {
      const ok = window.confirm(`Keluar dari board "${proj.title}"?`);
      if (!ok) return;
      try {
        await leaveProject(proj.id);
      } catch (err) {
        alert('Gagal keluar: ' + err.message);
      }
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: 'var(--bg-main)' }}>
      {/* Top Navbar */}
      <header className="app-navbar px-4 py-2.5 sticky-top">
        <div className="container-fluid d-flex justify-content-between align-items-center px-0">
          <div className="d-flex align-items-center gap-2">
            <div
              className="bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-3 d-flex align-items-center justify-content-center"
              style={{ width: '34px', height: '34px' }}
            >
              <i className="bi bi-kanban-fill fs-6"></i>
            </div>
            <span className="fw-bold text-white fs-6 tracking-wide">
              Trello<span className="text-primary">Clone</span>
            </span>
          </div>

          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center gap-2">
              <div
                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold shadow-sm"
                style={{ width: '32px', height: '32px', fontSize: '12px' }}
              >
                {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="text-secondary small d-none d-sm-inline">{user?.email}</span>
            </div>

            <button
              type="button"
              onClick={logout}
              className="btn btn-outline-danger border-0 btn-sm p-1.5 opacity-75 hover-opacity-100"
              title="Keluar Akun"
            >
              <i className="bi bi-box-arrow-right fs-6"></i>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Dashboard */}
      <main className="container py-5 flex-grow-1" style={{ maxWidth: '1100px' }}>
        {/* Header Action Section */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 pb-4 mb-4 border-bottom border-secondary border-opacity-15">
          <div>
            <h4 className="fw-bold text-white mb-1">Daftar Workspace</h4>
            <p className="task-desc mb-0">
              Kelola board aktif Anda atau bergabung ke tim lain melalui kode project.
            </p>
          </div>

          <div className="d-flex gap-2">
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary btn-sm d-flex align-items-center gap-1.5 px-3 py-2 rounded-2 fw-medium shadow-sm"
            >
              <i className="bi bi-plus-lg"></i>
              <span>Buat Board</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setJoinError('');
                setShowJoinModal(true);
              }}
              className="btn btn-outline-info modern-input btn-sm d-flex align-items-center gap-1.5 px-3 py-2 rounded-2 fw-medium"
            >
              <i className="bi bi-box-arrow-in-down-right"></i>
              <span>Gabung Kode</span>
            </button>
          </div>
        </div>

        {/* Board Cards Grid */}
        {loading ? (
          <div className="d-flex flex-column align-items-center justify-content-center py-5 text-secondary gap-2">
            <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
            <span className="small">Memuat daftar workspace...</span>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-5 my-4">
            <div
              className="kanban-column-card p-5 mx-auto text-center"
              style={{ maxWidth: '440px' }}
            >
              <div
                className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                style={{ width: '56px', height: '56px' }}
              >
                <i className="bi bi-layout-three-columns fs-3"></i>
              </div>
              <h6 className="fw-bold text-white mb-1">Belum Ada Workspace</h6>
              <p className="task-desc mb-4">
                Buat board pertama untuk mulai mencatat task, atau gabung ke board yang sudah ada menggunakan kode undangan tim.
              </p>
              <div className="d-flex justify-content-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="btn btn-primary btn-sm px-3 py-1.5 rounded-2"
                >
                  + Buat Board
                </button>
                <button
                  type="button"
                  onClick={() => setShowJoinModal(true)}
                  className="btn btn-outline-info modern-input btn-sm px-3 py-1.5 rounded-2"
                >
                  Gabung Kode
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="row g-3.5">
            {projects.map((proj) => {
              const isOwner = proj.user_id === user?.id;

              return (
                <div key={proj.id} className="col-12 col-md-6 col-lg-4">
                  <div className="kanban-task-card h-100 d-flex flex-column p-4 position-relative">
                    {/* Top Row: Role Badge & Copy Code */}
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span
                        className={`badge rounded-pill fw-medium d-inline-flex align-items-center gap-1.5 py-1 px-2.5 ${
                          isOwner
                            ? 'bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25'
                            : 'bg-info bg-opacity-10 text-info border border-info border-opacity-25'
                        }`}
                        style={{ fontSize: '10px', letterSpacing: '0.4px' }}
                      >
                        <span
                          className="rounded-circle"
                          style={{
                            width: '5px',
                            height: '5px',
                            backgroundColor: isOwner ? '#3b82f6' : '#06b6d4',
                          }}
                        ></span>
                        {isOwner ? 'OWNER' : 'MEMBER'}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleCopyCode(proj.code, proj.id)}
                        className="btn btn-outline-secondary modern-input btn-sm py-0.5 px-2 d-flex align-items-center gap-1.5"
                        style={{ fontSize: '11px' }}
                        title="Klik untuk salin kode undangan"
                      >
                        <i
                          className={
                            copiedId === proj.id
                              ? 'bi bi-check2 text-success'
                              : 'bi bi-copy text-secondary'
                          }
                        ></i>
                        <span className="font-monospace text-info fw-semibold">
                          {proj.code || 'CODE'}
                        </span>
                      </button>
                    </div>

                    {/* Middle: Title & Meta */}
                    <h5 className="text-white fw-bold mb-1 fs-6 lh-base">{proj.title}</h5>
                    <p className="task-desc mb-4 flex-grow-1" style={{ fontSize: '12px' }}>
                      Dibuat pada {new Date(proj.created_at).toLocaleDateString('id-ID')}
                    </p>

                    {/* Bottom: Open & Action Button */}
                    <div className="d-flex gap-2 pt-3 border-top border-secondary border-opacity-15 mt-auto">
                      <button
                        type="button"
                        onClick={() => navigate(`/board/${proj.id}`)}
                        className="btn btn-primary btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-1.5 py-1.5 rounded-2 fw-medium"
                      >
                        <i className="bi bi-kanban"></i>
                        <span>Buka Board</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleActionProject(proj, isOwner)}
                        className={`btn btn-sm px-2.5 rounded-2 border-0 opacity-75 hover-opacity-100 ${
                          isOwner ? 'btn-outline-danger' : 'btn-outline-warning'
                        }`}
                        title={isOwner ? 'Hapus Board Permanen' : 'Keluar dari Board'}
                      >
                        <i className={isOwner ? 'bi bi-trash3' : 'bi bi-box-arrow-left'}></i>
                      </button>
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
            <div className="modal-content kanban-column-card text-light">
              <div className="modal-header border-secondary border-opacity-25 py-2.5 px-3">
                <h6 className="modal-title small fw-bold">Board Baru</h6>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowCreateModal(false)}
                ></button>
              </div>
              <form onSubmit={handleCreate}>
                <div className="modal-body px-3 py-3">
                  <label className="form-label small text-secondary mb-1">Nama Board</label>
                  <input
                    type="text"
                    placeholder="Contoh: Mobile App, Portfolio"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="form-control form-control-sm modern-input py-1.5 px-2.5"
                    autoFocus
                  />
                </div>
                <div className="modal-footer border-secondary border-opacity-25 py-2 px-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn btn-outline-secondary modern-input btn-sm py-1 px-2.5"
                  >
                    Batal
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm py-1 px-3 fw-medium">
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
            <div className="modal-content kanban-column-card text-light">
              <div className="modal-header border-secondary border-opacity-25 py-2.5 px-3">
                <h6 className="modal-title small fw-bold">Gabung Workspace</h6>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowJoinModal(false);
                    setJoinError('');
                  }}
                ></button>
              </div>
              <form onSubmit={handleJoin}>
                <div className="modal-body px-3 py-3">
                  {joinError && (
                    <div className="alert alert-danger py-1 px-2 small mb-2">{joinError}</div>
                  )}
                  <label className="form-label small text-secondary mb-1">Kode Board (6 Karakter)</label>
                  <input
                    type="text"
                    placeholder="Contoh: 7K9M2X"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    className="form-control form-control-sm modern-input font-monospace text-center py-1.5 fs-6 tracking-wider"
                    autoFocus
                  />
                </div>
                <div className="modal-footer border-secondary border-opacity-25 py-2 px-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowJoinModal(false);
                      setJoinError('');
                    }}
                    className="btn btn-outline-secondary modern-input btn-sm py-1 px-2.5"
                  >
                    Batal
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm py-1 px-3 fw-medium">
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
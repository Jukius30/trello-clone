// src/pages/BoardPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBoard } from '../hooks/useBoard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function BoardPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    projects,
    currentProject,
    setCurrentProject,
    columns,
    tasks,
    loading,
    createProject,
    joinProject,
    leaveProject,
    deleteProject,
    moveTask,
    addTask,
    deleteTask,
  } = useBoard();

  const [newProjectName, setNewProjectName] = useState('');
  const [showProjectModal, setShowProjectModal] = useState(false);

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinProjectId, setJoinProjectId] = useState('');
  const [joinError, setJoinError] = useState('');

  // Form Task Baru
  const [activeColumnInput, setActiveColumnInput] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('Medium');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (projectId && projects.length > 0) {
      const match = projects.find((p) => p.id === projectId);
      if (match) setCurrentProject(match);
    }
  }, [projectId, projects, setCurrentProject]);

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e, targetColumnId) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) moveTask(taskId, targetColumnId);
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    const newProj = await createProject(newProjectName);
    setNewProjectName('');
    setShowProjectModal(false);
    if (newProj) navigate(`/board/${newProj.id}`);
  };

  const handleJoinProject = async (e) => {
    e.preventDefault();
    setJoinError('');
    if (!joinProjectId.trim()) return;

    try {
      const joinedProj = await joinProject(joinProjectId.trim());
      setJoinProjectId('');
      setShowJoinModal(false);
      if (joinedProj) navigate(`/board/${joinedProj.id}`);
    } catch (err) {
      setJoinError(err.message);
    }
  };

  const resetTaskForm = () => {
    setActiveColumnInput(null);
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskPriority('Medium');
  };

  const handleCreateTask = async (columnId) => {
    if (!newTaskTitle.trim()) return;
    await addTask(columnId, newTaskTitle, newTaskDescription, newTaskPriority);
    resetTaskForm();
  };

  const filteredTasks = tasks.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      t.title?.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q)
    );
  });

  // Soft Badge & Border Accent Modern
  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'High':
        return {
          badge: 'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25',
          borderLeft: '#f43f5e',
          dot: '#f43f5e',
        };
      case 'Medium':
        return {
          badge: 'bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25',
          borderLeft: '#f59e0b',
          dot: '#f59e0b',
        };
      default:
        return {
          badge: 'bg-success bg-opacity-10 text-success border border-success border-opacity-25',
          borderLeft: '#10b981',
          dot: '#10b981',
        };
    }
  };

  // Header Icon untuk tiap Kolom
  const getColumnIcon = (title) => {
    const t = title.toLowerCase();
    if (t.includes('progress')) return 'bi bi-lightning-charge text-warning';
    if (t.includes('done')) return 'bi bi-check-circle text-success';
    return 'bi bi-circle text-secondary';
  };

  return (
    <div className="d-flex flex-column vh-100 bg-black text-light overflow-hidden">
      {/* Navbar Atas */}
      <Navbar
        projects={projects}
        currentProject={currentProject}
        onSelectProject={setCurrentProject}
        onOpenNewProject={() => setShowProjectModal(true)}
        onOpenJoinProject={() => {
          setJoinError('');
          setShowJoinModal(true);
        }}
        onLeaveProject={leaveProject}
        onDeleteProject={deleteProject}
        user={user}
        onLogout={logout}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Konten Utama Kanban Board */}
      <main className="flex-grow-1 p-3 overflow-hidden" style={{ backgroundColor: '#090a0f' }}>
        {loading ? (
          <div className="h-100 d-flex flex-column align-items-center justify-content-center text-secondary gap-2">
            <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
            <span className="small">Memuat data board...</span>
          </div>
        ) : !currentProject ? (
          <div className="h-100 d-flex flex-column align-items-center justify-content-center text-center">
            <div className="kanban-column-card p-4 shadow text-center" style={{ maxWidth: '380px' }}>
              <i className="bi bi-kanban fs-1 text-primary opacity-75 mb-2 d-block"></i>
              <h6 className="fw-bold text-white mb-1">Pilih Workspace</h6>
              <p className="text-secondary small mb-3">
                Silakan pilih board yang ingin dikerjakan dari dashboard utama.
              </p>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn btn-primary btn-sm px-3 py-1.5"
              >
                Lihat Semua Board
              </button>
            </div>
          </div>
        ) : (
          <div className="row h-100 g-3 align-items-stretch m-0">
            {columns.map((col) => {
              const colTasks = filteredTasks.filter((t) => t.column_id === col.id);

              return (
                <div key={col.id} className="col h-100 d-flex flex-column p-1">
                  <div
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, col.id)}
                    className="card kanban-column-card d-flex flex-column h-100 w-100"
                  >
                    {/* Header Kolom */}
                    <div className="card-header kanban-column-header d-flex justify-content-between align-items-center py-2.5 px-3">
                      <div className="d-flex align-items-center gap-2">
                        <i className={getColumnIcon(col.title)}></i>
                        <span className="fw-semibold text-light small tracking-wide">
                          {col.title}
                        </span>
                      </div>
                      <span
                        className="badge bg-secondary bg-opacity-25 text-light rounded-pill px-2 py-1"
                        style={{ fontSize: '11px' }}
                      >
                        {colTasks.length}
                      </span>
                    </div>

                    {/* Task List */}
                    <div
                      className="card-body overflow-auto p-2.5 d-flex flex-column gap-2 flex-grow-1"
                      style={{ minHeight: 0 }}
                    >
                      {colTasks.length === 0 ? (
                        <div className="h-100 d-flex flex-column align-items-center justify-content-center text-secondary opacity-50 small fst-italic">
                          <i className="bi bi-plus-circle-dotted fs-4 mb-1"></i>
                          <span>Belum ada task</span>
                        </div>
                      ) : (
                        colTasks.map((task) => {
                          const priorityStyle = getPriorityStyle(task.priority);

                          return (
                            <div
                              key={task.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, task.id)}
                              className="kanban-task-card p-3 text-start position-relative"
                              style={{
                                cursor: 'grab',
                                borderLeft: `3px solid ${priorityStyle.borderLeft}`,
                              }}
                            >
                              {/* Header Task */}
                              <div className="d-flex justify-content-between align-items-start gap-2 mb-1.5">
                                <span className="fw-semibold text-white small lh-sm pe-1">
                                  {task.title}
                                </span>
                                <div className="d-flex align-items-center gap-1 opacity-75">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteTask(task.id);
                                    }}
                                    className="btn btn-link text-secondary p-0 border-0 text-hover-danger"
                                    title="Hapus Task"
                                    style={{ fontSize: '12px', lineHeight: 1 }}
                                  >
                                    <i className="bi bi-trash3"></i>
                                  </button>
                                  <i className="bi bi-grip-vertical text-secondary ms-1 opacity-50"></i>
                                </div>
                              </div>

                              {/* Deskripsi Task */}
                              {task.description && (
                                <p
                                  className="task-desc mb-2.5"
                                  style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                                >
                                  {task.description}
                                </p>
                              )}

                              {/* Footer Task */}
                              <div className="d-flex justify-content-between align-items-center pt-2 border-top border-secondary border-opacity-10 mt-1">
                                <span
                                  className={`badge rounded-pill fw-medium d-inline-flex align-items-center gap-1.5 py-1 px-2 ${priorityStyle.badge}`}
                                  style={{ fontSize: '10px' }}
                                >
                                  <span
                                    className="rounded-circle"
                                    style={{
                                      width: '5px',
                                      height: '5px',
                                      backgroundColor: priorityStyle.dot,
                                    }}
                                  ></span>
                                  {task.priority}
                                </span>

                                <i className="bi bi-card-text text-secondary opacity-40 small"></i>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Footer Kolom: Form Input Task */}
                    <div className="card-footer bg-transparent border-top border-secondary border-opacity-15 p-2 mt-auto">
                      {activeColumnInput === col.id ? (
                        <div className="d-flex flex-column gap-2 p-1">
                          <input
                            type="text"
                            placeholder="Judul task..."
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            className="form-control form-control-sm modern-input py-1.5 px-2.5 small"
                            autoFocus
                          />
                          <textarea
                            placeholder="Deskripsi task (opsional)..."
                            value={newTaskDescription}
                            onChange={(e) => setNewTaskDescription(e.target.value)}
                            className="form-control form-control-sm modern-input py-1.5 px-2.5 small"
                            rows="2"
                          />
                          <div className="d-flex justify-content-between align-items-center mt-1">
                            <select
                              value={newTaskPriority}
                              onChange={(e) => setNewTaskPriority(e.target.value)}
                              className="form-select form-select-sm modern-input py-1 px-2"
                              style={{ width: '95px', height: '28px', fontSize: '11px' }}
                            >
                              <option value="Low">Low</option>
                              <option value="Medium">Medium</option>
                              <option value="High">High</option>
                            </select>
                            <div className="d-flex gap-1.5">
                              <button
                                type="button"
                                onClick={resetTaskForm}
                                className="btn btn-outline-secondary modern-input btn-sm py-0.5 px-2 text-secondary"
                                style={{ height: '28px', fontSize: '12px' }}
                              >
                                Batal
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCreateTask(col.id)}
                                className="btn btn-primary btn-sm py-0.5 px-2.5 fw-medium"
                                style={{ height: '28px', fontSize: '12px' }}
                              >
                                Tambah
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            resetTaskForm();
                            setActiveColumnInput(col.id);
                          }}
                          className="btn btn-sm btn-outline-secondary modern-input w-100 d-flex align-items-center justify-content-center gap-1.5 py-1.5 opacity-75 hover-opacity-100"
                        >
                          <i className="bi bi-plus-lg small"></i>
                          <span className="small fw-medium">Tambah Task</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer Bawah */}
      <Footer totalTasks={tasks.length} currentProjectTitle={currentProject?.title} />

      {/* Modal Buat Project Baru */}
      {showProjectModal && (
        <div className="modal d-block bg-black bg-opacity-75" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content kanban-column-card text-light">
              <div className="modal-header border-secondary border-opacity-25 py-2 px-3">
                <h6 className="modal-title small fw-bold">Project Baru</h6>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowProjectModal(false)}
                ></button>
              </div>
              <form onSubmit={handleCreateProject}>
                <div className="modal-body px-3 py-2.5">
                  <label className="form-label small text-secondary mb-1">Nama Project</label>
                  <input
                    type="text"
                    placeholder="Contoh: Mobile App, Web Store"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="form-control form-control-sm modern-input py-1.5 px-2.5"
                    autoFocus
                  />
                </div>
                <div className="modal-footer border-secondary border-opacity-25 py-2 px-3">
                  <button
                    type="button"
                    onClick={() => setShowProjectModal(false)}
                    className="btn btn-outline-secondary modern-input btn-sm py-1 px-2.5"
                  >
                    Batal
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm py-1 px-3">
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Gabung Project */}
      {showJoinModal && (
        <div className="modal d-block bg-black bg-opacity-75" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content kanban-column-card text-light">
              <div className="modal-header border-secondary border-opacity-25 py-2 px-3">
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
              <form onSubmit={handleJoinProject}>
                <div className="modal-body px-3 py-2.5">
                  {joinError && (
                    <div className="alert alert-danger py-1 px-2 small mb-2">{joinError}</div>
                  )}
                  <label className="form-label small text-secondary mb-1">Kode Undangan (6 Karakter)</label>
                  <input
                    type="text"
                    placeholder="Contoh: 7K9M2X"
                    value={joinProjectId}
                    onChange={(e) => setJoinProjectId(e.target.value.toUpperCase())}
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
                  <button type="submit" className="btn btn-primary btn-sm py-1 px-3">
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
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useBoard } from "../hooks/useBoard";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function BoardPage() {
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
    moveTask,
    addTask,
    deleteTask,
  } = useBoard();

  const [newProjectName, setNewProjectName] = useState("");
  const [showProjectModal, setShowProjectModal] = useState(false);

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinProjectId, setJoinProjectId] = useState("");
  const [joinError, setJoinError] = useState("");

  const [activeColumnInput, setActiveColumnInput] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("Medium");
  const [searchQuery, setSearchQuery] = useState("");

  // Drag and drop handlers
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData("text/plain", taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetColumnId) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId) {
      moveTask(taskId, targetColumnId);
    }
  };

  // Buat Project Baru
  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    await createProject(newProjectName);
    setNewProjectName("");
    setShowProjectModal(false);
  };

  // Gabung ke Project Teman
  const handleJoinProject = async (e) => {
    e.preventDefault();
    setJoinError("");
    if (!joinProjectId.trim()) return;

    try {
      await joinProject(joinProjectId.trim());
      setJoinProjectId("");
      setShowJoinModal(false);
    } catch (err) {
      setJoinError(err.message);
    }
  };

  // Buat Task Baru
  const handleCreateTask = async (columnId) => {
    if (!newTaskTitle.trim()) return;
    await addTask(columnId, newTaskTitle, newTaskPriority);
    setNewTaskTitle("");
    setNewTaskPriority("Medium");
    setActiveColumnInput(null);
  };

  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getPriorityBadge = (priority) => {
    if (priority === "High") return "bg-danger text-white";
    if (priority === "Medium") return "bg-warning text-dark";
    return "bg-success text-white";
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
          setJoinError("");
          setShowJoinModal(true);
        }}
        user={user}
        onLogout={logout}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Board View */}
      <main className="flex-grow-1 overflow-auto p-4 bg-dark bg-opacity-75">
        {loading ? (
          <div className="h-100 d-flex align-items-center justify-content-center text-secondary">
            <div
              className="spinner-border spinner-border-sm me-2 text-primary"
              role="status"
            ></div>
            <span>Memuat data board...</span>
          </div>
        ) : !currentProject ? (
          <div className="h-100 d-flex flex-column align-items-center justify-content-center text-center">
            <div
              className="card bg-dark border-secondary p-4 shadow"
              style={{ maxWidth: "380px" }}
            >
              <h5 className="card-title text-white">Belum Ada Project</h5>
              <p className="card-text text-secondary small">
                Buat project baru atau bergabung ke workspace teman menggunakan
                Project ID.
              </p>
              <div className="d-flex justify-content-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowProjectModal(true)}
                  className="btn btn-primary btn-sm"
                >
                  + Project Baru
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setJoinError("");
                    setShowJoinModal(true);
                  }}
                  className="btn btn-outline-info btn-sm"
                >
                  Gabung Project
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="d-flex gap-3 align-items-start pb-2"
            style={{ minHeight: "100%" }}
          >
            {columns.map((col) => {
              const colTasks = filteredTasks.filter(
                (t) => t.column_id === col.id,
              );

              return (
                <div
                  key={col.id}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, col.id)}
                  className="card bg-dark border-secondary shadow-sm"
                  style={{
                    width: "300px",
                    flexShrink: 0,
                    maxHeight: "calc(100vh - 145px)",
                  }}
                >
                  {/* Column Header */}
                  <div className="card-header bg-dark border-secondary d-flex justify-content-between align-items-center py-2">
                    <span className="fw-semibold text-light small">
                      {col.title}
                    </span>
                    <span className="badge bg-secondary rounded-pill">
                      {colTasks.length}
                    </span>
                  </div>

                  {/* Task List */}
                  <div
                    className="card-body overflow-auto p-2 d-flex flex-column gap-2"
                    style={{ minHeight: "80px" }}
                  >
                    {colTasks.map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        className="card bg-black border-secondary p-2 shadow-sm text-start"
                        style={{ cursor: "grab" }}
                      >
                        <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                          <p className="card-text text-light small mb-0 pe-2">
                            {task.title}
                          </p>
                          <div className="d-flex align-items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteTask(task.id);
                              }}
                              className="btn btn-link text-secondary text-hover-danger p-0 border-0"
                              title="Hapus Task"
                              style={{ fontSize: "13px", lineHeight: 1 }}
                            >
                              <i className="bi bi-trash3"></i>
                            </button>
                            <i className="bi bi-grip-vertical text-secondary ms-1"></i>
                          </div>
                        </div>

                        <div>
                          <span
                            className={`badge ${getPriorityBadge(task.priority)}`}
                            style={{ fontSize: "10px" }}
                          >
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Task Footer */}
                  <div className="card-footer bg-dark border-secondary p-2">
                    {activeColumnInput === col.id ? (
                      <div className="d-flex flex-column gap-2">
                        <textarea
                          placeholder="Deskripsi task..."
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          className="form-control form-control-sm bg-black border-secondary text-white"
                          rows="2"
                          autoFocus
                        />
                        <div className="d-flex justify-content-between align-items-center">
                          <select
                            value={newTaskPriority}
                            onChange={(e) => setNewTaskPriority(e.target.value)}
                            className="form-select form-select-sm bg-black border-secondary text-white py-0 px-2"
                            style={{
                              width: "90px",
                              height: "28px",
                              fontSize: "12px",
                            }}
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                          </select>
                          <div className="d-flex gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveColumnInput(null);
                                setNewTaskTitle("");
                              }}
                              className="btn btn-outline-secondary btn-sm py-0 px-2"
                              style={{ height: "28px" }}
                            >
                              Batal
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCreateTask(col.id)}
                              className="btn btn-primary btn-sm py-0 px-2"
                              style={{ height: "28px" }}
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
                          setActiveColumnInput(col.id);
                          setNewTaskTitle("");
                        }}
                        className="btn btn-sm btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-1"
                      >
                        <i className="bi bi-plus-lg"></i> Tambah Task
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer Bawah */}
      <Footer
        totalTasks={tasks.length}
        currentProjectTitle={currentProject?.title}
      />

      {/* Modal Buat Project Baru */}
      {showProjectModal && (
        <div className="modal d-block bg-black bg-opacity-75" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content bg-dark border-secondary text-light">
              <div className="modal-header border-secondary py-2">
                <h6 className="modal-title">Project Baru</h6>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowProjectModal(false)}
                ></button>
              </div>
              <form onSubmit={handleCreateProject}>
                <div className="modal-body">
                  <label className="form-label small text-secondary">
                    Nama Project
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Mobile App"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="form-control form-control-sm bg-black border-secondary text-white"
                    autoFocus
                  />
                </div>
                <div className="modal-footer border-secondary py-2">
                  <button
                    type="button"
                    onClick={() => setShowProjectModal(false)}
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

      {/* Modal Gabung Project */}
      {showJoinModal && (
        <div className="modal d-block bg-black bg-opacity-75" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content bg-dark border-secondary text-light">
              <div className="modal-header border-secondary py-2">
                <h6 className="modal-title">Gabung ke Project</h6>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowJoinModal(false);
                    setJoinError("");
                  }}
                ></button>
              </div>
              <form onSubmit={handleJoinProject}>
                <div className="modal-body">
                  {joinError && (
                    <div className="alert alert-danger py-1 px-2 small mb-2">
                      {joinError}
                    </div>
                  )}
                  <label className="form-label small text-secondary">
                    Kode Project (6 Karakter)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 7K9M2X"
                    value={joinProjectId}
                    onChange={(e) =>
                      setJoinProjectId(e.target.value.toUpperCase())
                    }
                    maxLength={6}
                    className="form-control form-control-sm bg-black border-secondary text-white font-monospace text-center fs-6 tracking-wider"
                    autoFocus
                  />
                </div>
                <div className="modal-footer border-secondary py-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowJoinModal(false);
                      setJoinError("");
                    }}
                    className="btn btn-secondary btn-sm"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="btn btn-info btn-sm text-dark fw-semibold"
                  >
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

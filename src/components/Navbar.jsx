// src/components/Navbar.jsx
import { useState } from "react";

export default function Navbar({
  projects,
  currentProject,
  onSelectProject,
  onOpenNewProject,
  onOpenJoinProject,
  user,
  onLogout,
  searchQuery,
  onSearchChange,
}) {
  const [copied, setCopied] = useState(false);

  const copyProjectId = () => {
    if (!currentProject?.id) return;
    navigator.clipboard.writeText(currentProject.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark border-bottom border-secondary px-3 py-2">
      <div className="container-fluid gap-2">
        {/* Brand */}
        <span className="navbar-brand d-flex align-items-center gap-2 fw-bold text-white mb-0">
          <i className="bi bi-kanban-fill text-primary fs-5"></i>
          TrelloClone
        </span>

        {/* Project Selector & Actions */}
        <div className="d-flex align-items-center gap-2">
          {projects.length > 0 ? (
            <select
              value={currentProject?.id || ""}
              onChange={(e) => {
                const target = projects.find((p) => p.id === e.target.value);
                onSelectProject(target);
              }}
              className="form-select form-select-sm bg-dark text-white border-secondary"
              style={{ width: "auto" }}
            >
              {projects.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          ) : (
            <small className="text-secondary fst-italic">
              Belum ada project
            </small>
          )}

          {/* Copy ID Button */}
          {currentProject && (
            <div className="d-flex align-items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  if (!currentProject?.code) return;
                  navigator.clipboard.writeText(currentProject.code);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1.5"
                title="Salin Kode Project"
              >
                <i
                  className={
                    copied ? "bi bi-check2 text-success" : "bi bi-copy"
                  }
                ></i>
                <span className="font-monospace fw-bold text-info">
                  {currentProject.code || "NO-CODE"}
                </span>
                <small className="text-secondary d-none d-md-inline">
                  {copied ? "(Tersalin!)" : "(Salin)"}
                </small>
              </button>
            </div>
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

          {/* Gabung Project Orang Lain */}
          <button
            type="button"
            onClick={onOpenJoinProject}
            className="btn btn-outline-info btn-sm d-flex align-items-center gap-1"
          >
            <i className="bi bi-box-arrow-in-down-right"></i>
            <span className="d-none d-sm-inline">Gabung Project</span>
          </button>
        </div>

        {/* Search & Profile */}
        <div className="ms-auto d-flex align-items-center gap-3">
          <div
            className="input-group input-group-sm d-none d-md-flex"
            style={{ width: "180px" }}
          >
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
              style={{ width: "32px", height: "32px", fontSize: "13px" }}
            >
              {user?.email ? user.email.charAt(0).toUpperCase() : "U"}
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="btn btn-outline-danger btn-sm py-1 px-2"
              title="Keluar"
            >
              <i className="bi bi-box-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

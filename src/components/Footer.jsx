// src/components/Footer.jsx
export default function Footer({ totalTasks = 0, currentProjectTitle = '' }) {
  return (
    <footer className="app-navbar border-top border-secondary border-opacity-15 px-3 py-2 mt-auto">
      <div className="container-fluid d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 px-1">
        {/* Kiri: Status Proyek & Task Counter */}
        <div className="d-flex align-items-center gap-3">
          {currentProjectTitle && (
            <div className="d-flex align-items-center gap-1.5 text-secondary small">
              <i className="bi bi-folder2-open text-primary opacity-75"></i>
              <span className="text-light fw-medium">{currentProjectTitle}</span>
            </div>
          )}

          <div className="d-flex align-items-center gap-1.5 text-secondary small border-start border-secondary border-opacity-25 ps-3">
            <span className="text-secondary">Total:</span>
            <span className="badge bg-secondary bg-opacity-25 text-light rounded-pill px-2 py-0.5 font-monospace">
              {totalTasks} {totalTasks === 1 ? 'task' : 'tasks'}
            </span>
          </div>
        </div>

        {/* Kanan: System Status Indicator & Copyright */}
        <div className="d-flex align-items-center gap-3 text-secondary small">
          <div className="d-flex align-items-center gap-1.5" title="Supabase Realtime Sync Active">
            <span
              className="rounded-circle bg-success shadow-sm"
              style={{
                width: '6px',
                height: '6px',
                boxShadow: '0 0 8px rgba(34, 197, 94, 0.6)',
              }}
            ></span>
            <span className="font-monospace" style={{ fontSize: '11px', color: '#94a3b8' }}>
              Synced
            </span>
          </div>

          <span className="border-start border-secondary border-opacity-25 ps-3 opacity-60" style={{ fontSize: '11px' }}>
            &copy; {new Date().getFullYear()} TrelloClone
          </span>
        </div>
      </div>
    </footer>
  );
}
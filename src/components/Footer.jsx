export default function Footer({ totalTasks = 0, currentProjectTitle = '' }) {
  return (
    <footer className="bg-dark text-secondary border-top border-secondary py-2 px-3 small d-flex justify-content-between align-items-center">
      <div className="d-flex align-items-center gap-3">
        <span>
          <i className="bi bi-folder2-open text-primary me-1"></i>
          Project: <strong className="text-light">{currentProjectTitle || '-'}</strong>
        </span>
        <span className="d-none d-sm-inline">•</span>
        <span className="d-none d-sm-inline">
          <i className="bi bi-check2-circle text-success me-1"></i>
          Total Task: <strong className="text-light">{totalTasks}</strong>
        </span>
      </div>

      <div className="d-flex align-items-center gap-1">
        <i className="bi bi-shield-check text-info"></i>
        <span style={{ fontSize: '11px' }}>RLS Secured • Supabase</span>
      </div>
    </footer>
  );
}
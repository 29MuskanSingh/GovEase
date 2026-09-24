import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/', label: 'Dashboard', icon: DashboardIcon },
  { path: '/users', label: 'Users', icon: UsersIcon },
  { path: '/eligibility-rules', label: 'Eligibility Rules', icon: RulesIcon },
  { path: '/exams', label: 'Exams', icon: ExamsIcon },
  { path: '/opportunities', label: 'Opportunities', icon: OpportunitiesIcon },
  { path: '/forms', label: 'Dynamic Forms', icon: FormsIcon },
  { path: '/audit-logs', label: 'Audit Logs', icon: AuditIcon },
];

function DashboardIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}

function UsersIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function RulesIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function FormsIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6M4 6h16v2H4zM4 16h16v2H4z" />
    </svg>
  );
}

function ExamsIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}

function OpportunitiesIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}

function AuditIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="layout">
      <aside className="sidebar" role="navigation" aria-label="Main navigation">
        <div className="sidebar-header">
          <h1>GovEase Admin</h1>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Main</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path)) ? 'active' : ''}`}
              >
                <Icon className="nav-icon" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          </div>
        </nav>
        <div className="sidebar-footer">
          <div className="user-menu">
            <div className="user-avatar">
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div>
              <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{user?.email}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{user?.role}</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="header" role="banner">
          <div className="header-left">
            <h1 className="page-title">{getPageTitle(location.pathname)}</h1>
          </div>
          <div className="header-right">
            <button onClick={handleLogout} className="btn btn-ghost btn-sm" style={{ padding: '0.375rem 0.75rem' }}>
              Logout
            </button>
          </div>
        </header>
        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function getPageTitle(pathname) {
  const titles = {
    '/': 'Dashboard',
    '/users': 'Users',
    '/eligibility-rules': 'Eligibility Rules',
    '/exams': 'Exams',
    '/forms': 'Dynamic Forms',
    '/opportunities': 'Opportunities',
    '/audit-logs': 'Audit Logs',
  };
  
  for (const [path, title] of Object.entries(titles)) {
    if (pathname === path || (path !== '/' && pathname.startsWith(path))) {
      return title;
    }
  }
  return 'GovEase Admin';
}
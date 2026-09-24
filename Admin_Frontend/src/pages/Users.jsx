import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi, ApiError } from '../api/adminApi';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';

const STATUS_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'Suspended', label: 'Suspended' },
  { value: 'Deleted', label: 'Deleted' }
];

export default function Users() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [resetUser, setResetUser] = useState(null);
  const [tempPassword, setTempPassword] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (query) params.q = query;
      if (statusFilter) params.status = statusFilter;
      if (roleFilter) params.role = roleFilter;
      const response = await adminApi.users.list(params);
      setUsers(response.users || []);
      setPagination(response.pagination || pagination);
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : 'Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, query, statusFilter, roleFilter]);

  const handleResetPassword = async (id) => {
    try {
      const response = await adminApi.users.resetPassword(id);
      setTempPassword(response.temporaryPassword);
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : 'Reset failed', 'error');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await adminApi.users.update(id, { status });
      addToast('User updated', 'success');
      load();
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : 'Update failed', 'error');
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      await adminApi.users.update(id, { role });
      addToast('User updated', 'success');
      load();
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : 'Update failed', 'error');
    }
  };

  return (
    <div>
      <div className="search-filter-bar">
        <input className="search-input form-input" type="text" placeholder="Search users..." value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} />
        <select className="filter-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <select className="filter-select" value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}>
          <option value="">All roles</option>
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
      </div>

      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th><th>Full Name</th><th>Email</th><th>Role</th><th>Status</th><th>Reset</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td>{user._id}</td>
                        <td>{user.fullName || '—'}</td>
                        <td>{user.email}</td>
                        <td>
                          <select className="filter-select" value={user.role} onChange={(e) => handleRoleChange(user._id, e.target.value)} style={{ minWidth: '80px' }}>
                            <option value="USER">USER</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </td>
                        <td>
                          <select className="filter-select" value={user.status} onChange={(e) => handleStatusChange(user._id, e.target.value)} style={{ minWidth: '100px' }}>
                            {STATUS_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                          </select>
                        </td>
                        <td>
                          {user.role === 'ADMIN' ? '—' : (
                            <button className="btn btn-sm btn-secondary" onClick={() => { setResetUser(user); handleResetPassword(user._id); }}>
                              Reset password
                            </button>
                          )}
                        </td>
                        <td>
                          <span className="action-link" onClick={() => navigate(`/users/${user._id}`)}>View</span>
                        </td>
                      </tr>
                    ))}
                    {!users.length && <tr><td colSpan={7} style={{ textAlign: 'center' }}>No users found</td></tr>}
                  </tbody>
                </table>
              </div>
              {pagination.pages > 1 && (
                <div className="pagination">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</button>
                  <span style={{ padding: '0 0.5rem' }}>Page {pagination.page} of {pagination.pages}</span>
                  <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}>Next</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Modal
        isOpen={!!resetUser}
        onClose={() => { setResetUser(null); setTempPassword(''); }}
        title="Temporary password created"
        footer={
          <button className="btn btn-primary" onClick={() => { navigator.clipboard.writeText(tempPassword); addToast('Copied to clipboard', 'success'); }}>
            Copy to clipboard
          </button>
        }
      >
        <p style={{ color: 'var(--gray-700)', lineHeight: 1.6 }}>Share this temporary password with the user. They will be required to change it on next login.</p>
        <pre style={{ background: 'var(--gray-50)', padding: '0.75rem', borderRadius: 'var(--radius)', marginTop: '0.75rem', wordBreak: 'break-all' }}>{tempPassword}</pre>
      </Modal>
    </div>
  );
}

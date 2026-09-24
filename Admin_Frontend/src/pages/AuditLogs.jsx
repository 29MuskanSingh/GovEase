import { useEffect, useState } from 'react';
import { adminApi, ApiError } from '../api/adminApi';
import { useToast } from '../components/Toast';
import { formatDateTime } from '../utils/format';

export default function AuditLogs() {
  const { addToast } = useToast();
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 25 };
      if (query) params.actorEmail = query;
      if (actionFilter) params.action = actionFilter;
      const response = await adminApi.auditLogs.list(params);
      setLogs(response.logs || []);
      setPagination(response.pagination || pagination);
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : 'Failed to load audit logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, query, actionFilter]);

  return (
    <div>
      <div className="search-filter-bar">
        <input className="search-input form-input" type="text" placeholder="Search by actor email..." value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} />
        <input className="search-input form-input" type="text" placeholder="Filter by action..." value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }} />
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
                    <tr><th>Action</th><th>Resource</th><th>Resource ID</th><th>Actor</th><th>IP</th><th>At</th></tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log._id}>
                        <td>{log.action}</td>
                        <td>{log.resourceType}</td>
                        <td>{log.resourceId || '—'}</td>
                        <td>{log.actorEmail}</td>
                        <td>{log.ipAddress || '—'}</td>
                        <td>{formatDateTime(log.createdAt)}</td>
                      </tr>
                    ))}
                    {!logs.length && <tr><td colSpan={6} style={{ textAlign: 'center' }}>No audit logs found</td></tr>}
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
    </div>
  );
}

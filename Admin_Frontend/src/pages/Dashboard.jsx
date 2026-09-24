import { useEffect, useState } from 'react';
import { adminApi, ApiError } from '../api/adminApi';
import { formatDateTime } from '../utils/format';

const metricCards = [
  { key: 'totalUsers', label: 'Total Users' },
  { key: 'activeUsers', label: 'Active Users' },
  { key: 'suspendedUsers', label: 'Suspended Users' },
  { key: 'completedProfiles', label: 'Completed Profiles' },
  { key: 'totalDocuments', label: 'Documents Uploaded' },
  { key: 'pendingDocuments', label: 'Pending Documents' },
  { key: 'activeOpportunities', label: 'Active Opportunities' },
  { key: 'activeExams', label: 'Active Exams' },
  { key: 'activeEligibilityRules', label: 'Active Rules' }
];

const statusBadge = (status) => {
  const variants = {
    Verified: 'badge-success',
    Unverified: 'badge-warning',
    Pending: 'badge-warning',
    Rejected: 'badge-danger'
  };
  return <span className={`badge ${variants[status] || 'badge-gray'}`}>{status}</span>;
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminApi.dashboard.getMetrics();
      setData(response);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="form-error">{error}</div>;

  const metrics = data?.metrics || {};

  return (
    <div className="dashboard-metrics">
      <div className="metrics-grid">
        {metricCards.map(card => (
          <div key={card.key} className="card">
            <div className="card-body">
              <div className="metric-label">{card.label}</div>
              <div className="metric-value">{metrics[card.key] ?? 0}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header"><span className="card-title">Document Status</span></div>
        <div className="card-body">
          <div className="status-list">
            {(data?.documentStatuses || []).map((row) => (
              <div key={row._id} className="status-row">
                {statusBadge(row._id || 'Unknown')}
                <span style={{ marginLeft: '0.75rem' }}>{row.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header"><span className="card-title">Recent Users</span></div>
        <div className="card-body">
          <table className="table">
            <thead>
              <tr><th>ID</th><th>Full Name</th><th>Email</th><th>Role</th><th>Status</th><th>Created</th></tr>
            </thead>
            <tbody>
              {(data?.recentUsers || []).map((user) => (
                <tr key={user._id}>
                  <td>{user._id}</td>
                  <td>{user.fullName || user.email}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.status}</td>
                  <td>{formatDateTime(user.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header"><span className="card-title">Recent Activity</span></div>
        <div className="card-body">
          <table className="table">
            <thead>
              <tr><th>Action</th><th>Resource</th><th>Actor</th><th>At</th></tr>
            </thead>
            <tbody>
              {(data?.recentAuditLogs || []).map((log) => (
                <tr key={log._id}>
                  <td>{log.action}</td>
                  <td>{log.resourceType}</td>
                  <td>{log.actorEmail}</td>
                  <td>{formatDateTime(log.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

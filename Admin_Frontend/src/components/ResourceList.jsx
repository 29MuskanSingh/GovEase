import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './Toast';
import ConfirmDialog from './ConfirmDialog';

export default function ResourceList({ title, columns, load, addPath, editPath, viewPath, deleteAction, statusOptions }) {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchList = async (params = {}) => {
    setLoading(true);
    try {
      const response = await load({ page, limit: 20, q: query, status: statusFilter, ...params });
      setData(response);
    } catch (err) {
      addToast(err?.message || 'Failed to load records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList({ page, q: query, status: statusFilter });
  }, [page, query, statusFilter]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAction(deleteTarget);
      addToast('Record deleted', 'success');
      setDeleteTarget(null);
      fetchList({ reset: true });
    } catch (err) {
      addToast(err?.message || 'Delete failed', 'error');
    }
  };

  const renderValue = (row, column) => {
    if (column.render) return column.render(row[column.key], row);
    const value = row[column.key];
    if (value === null || value === undefined) return '—';
    return column.type === 'date' ? new Date(value).toLocaleDateString() : String(value);
  };

  return (
    <div>
      <div className="search-filter-bar">
        <input
          className="search-input form-input"
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1); }}
        />
        {statusOptions && (
          <select className="filter-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All statuses</option>
            {statusOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        )}
        {addPath && (
          <button className="btn btn-primary" onClick={() => navigate(addPath)}>+ Add {title}</button>
        )}
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
                      {columns.map(column => <th key={column.key}>{column.label}</th>)}
                      <th style={{ width: '120px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.items || []).map((row) => (
                      <tr key={row._id}>
                        {columns.map(column => <td key={column.key}>{renderValue(row, column)}</td>)}
                          <td>
                           <div className="table-actions">
                             {viewPath && <span className="action-link" onClick={() => navigate(`${viewPath.replace(':id', row._id)}`)}>View</span>}
                             {editPath && <span className="action-link" onClick={() => navigate(`${editPath.replace(':id', row._id)}`)}>Edit</span>}
                             {deleteAction && <span className="action-link-danger" onClick={() => setDeleteTarget(row._id)}>Delete</span>}
                           </div>
                         </td>
                      </tr>
                    ))}
                    {!data?.items?.length && <tr><td colSpan={columns.length + 1} style={{ textAlign: 'center' }}>No records found</td></tr>}
                  </tbody>
                </table>
              </div>
              {data?.pagination?.pages > 1 && (
                <div className="pagination">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</button>
                  <span style={{ padding: '0 0.5rem' }}>Page {page} of {data.pagination.pages}</span>
                  <button onClick={() => setPage(p => Math.min(data.pagination.pages, p + 1))} disabled={page === data.pagination.pages}>Next</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete record"
        message="Are you sure you want to delete this record?"
        confirmText="Delete"
      />
    </div>
  );
}

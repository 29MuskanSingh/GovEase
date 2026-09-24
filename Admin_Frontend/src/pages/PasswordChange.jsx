import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PasswordChange() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { changePassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 8) {
      return setError('New password must be at least 8 characters');
    }
    if (newPassword !== confirmPassword) {
      return setError('New passwords do not match');
    }
    setSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
      navigate('/');
    } catch (err) {
      setError(err?.message || 'Password change failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Change Password</h2>
        <p style={{ color: 'var(--gray-500)', marginBottom: '1rem' }}>You must set a new password before continuing.</p>
        {error && <div className="form-error" style={{ marginBottom: '1rem' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Current password</label>
            <input className="form-input" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">New password</label>
            <input className="form-input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm new password</label>
            <input className="form-input" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%' }}>
            {submitting ? 'Saving...' : 'Change password'}
          </button>
        </form>
      </div>
    </div>
  );
}

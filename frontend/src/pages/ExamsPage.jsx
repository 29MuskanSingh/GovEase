import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { examsApi } from '../api/examsApi';
import './ExamsPage.css';

const statusClass = (status) => `exam-badge-${(status || '').toLowerCase().replace(/ /g, '-')}`;

const statusBadge = (status) => {
  const label = status || 'Upcoming';
  return <span className={`exam-badge ${statusClass(status)}`}>{label}</span>;
};

export default function ExamsPage() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    examsApi.list()
      .then((data) => {
        if (data.success) {
          setExams(data.items || []);
        } else {
          setError(data.message || 'Failed to load exams');
        }
      })
      .catch(() => setError('Failed to load exams'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading exams...</div>;

  return (
    <div className="exams-page">
      <h1 className="exams-title">Available Exams</h1>
      {error && <div style={{ color: '#e53e3e', marginBottom: '1rem' }}>{error}</div>}
      {exams.length === 0 ? (
        <div style={{ color: '#7180ac' }}>No exams available right now. Please check back later.</div>
      ) : (
        <div className="exam-grid">
          {exams.map((exam) => (
            <div key={exam._id} className="exam-card">
              <div className="exam-card-header">
                <div>
                  <div className="exam-card-title">{exam.examName}</div>
                  <div style={{ fontSize: '0.8rem', color: '#7180ac' }}>{exam.examBody}</div>
                </div>
                {statusBadge(exam.status)}
              </div>
              <div className="exam-card-body">
                {exam.examCategory && <span>Category: {exam.examCategory}</span>}
                {exam.examMode && <span>Mode: {exam.examMode}</span>}
                {exam.durationMinutes && <span>Duration: {exam.durationMinutes} min</span>}
              </div>
              <div className="exam-card-meta">
                {exam.applicationStartDate && <span>Starts: {new Date(exam.applicationStartDate).toLocaleDateString()}</span>}
                {exam.applicationDeadline && <span>Deadline: {new Date(exam.applicationDeadline).toLocaleDateString()}</span>}
                {exam.examDate && <span>Exam: {new Date(exam.examDate).toLocaleDateString()}</span>}
              </div>
              <div className="exam-card-actions">
                <button className="btn btn-secondary" onClick={() => navigate(`/exams/${exam._id}`)}>View Details</button>
                <button className="btn btn-primary" onClick={() => navigate(`/exams/${exam._id}/apply`)}>Apply</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

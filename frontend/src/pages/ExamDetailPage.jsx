import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { examsApi } from '../api/examsApi';
import { useAuth } from '../context/AuthContext';
import './ExamsPage.css';

export default function ExamDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    examsApi.get(id)
      .then((data) => {
        if (data.success) setExam(data.item);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading">Loading exam...</div>;
  if (!exam) return <div className="exams-page">Exam not found.</div>;

  return (
    <div className="exams-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <h1 className="exams-title" style={{ marginBottom: 0 }}>{exam.examName} — Details</h1>
        <button className="btn btn-primary" onClick={() => navigate(`/exams/${exam._id}/apply`)} disabled={!isAuthenticated}>
          Apply Now
        </button>
      </div>

      <div className="exam-card">
        <div className="exam-card-header">
          <div>
            <div className="exam-card-title">{exam.examName}</div>
            <div style={{ fontSize: '0.8rem', color: '#7180ac' }}>{exam.examBody}</div>
          </div>
          <span className={`exam-badge ${('exam-badge-' + (exam.status || 'upcoming').toLowerCase().replace(/ /g, '-'))}`}>{exam.status || 'Upcoming'}</span>
        </div>
        <div className="exam-card-body">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr><th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>Category</th><td style={{ padding: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>{exam.examCategory || '—'}</td></tr>
              <tr><th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>Type</th><td style={{ padding: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>{exam.examType || '—'}</td></tr>
              <tr><th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>Mode</th><td style={{ padding: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>{exam.examMode || '—'}</td></tr>
              <tr><th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>Vacancies</th><td style={{ padding: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>{exam.totalVacancies || '—'}</td></tr>
              <tr><th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>Application Fee</th><td style={{ padding: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>{exam.applicationFee ?? '—'}</td></tr>
              <tr><th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>Total Marks</th><td style={{ padding: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>{exam.totalMarks || '—'}</td></tr>
              <tr><th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>Duration</th><td style={{ padding: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>{exam.durationMinutes ? `${exam.durationMinutes} min` : '—'}</td></tr>
              <tr><th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>Negative Marking</th><td style={{ padding: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>{exam.negativeMarking ? 'Yes' : 'No'}</td></tr>
              <tr><th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>Application Start</th><td style={{ padding: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>{exam.applicationStartDate ? new Date(exam.applicationStartDate).toLocaleDateString() : '—'}</td></tr>
              <tr><th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>Application Deadline</th><td style={{ padding: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>{exam.applicationDeadline ? new Date(exam.applicationDeadline).toLocaleDateString() : '—'}</td></tr>
              <tr><th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>Exam Date</th><td style={{ padding: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>{exam.examDate ? new Date(exam.examDate).toLocaleDateString() : '—'}</td></tr>
              <tr><th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>Result Date</th><td style={{ padding: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>{exam.resultDate ? new Date(exam.resultDate).toLocaleDateString() : '—'}</td></tr>
              <tr><th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>Official Website</th><td style={{ padding: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>{exam.officialWebsite ? <a href={exam.officialWebsite} target="_blank" rel="noreferrer">{exam.officialWebsite}</a> : '—'}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {exam.eligibilityRules && Object.keys(exam.eligibilityRules).length > 0 && (
        <div className="exam-card" style={{ marginTop: '1rem' }}>
          <div className="card-header"><span className="card-title">Eligibility</span></div>
          <div className="card-body">
            <pre style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', overflowX: 'auto' }}>{JSON.stringify(exam.eligibilityRules, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

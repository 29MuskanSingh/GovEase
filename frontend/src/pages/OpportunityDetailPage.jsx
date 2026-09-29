import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { opportunitiesApi } from '../api/examsApi';
import './ExamsPage.css';

const asList = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return value.split(',').map((s) => s.trim()).filter(Boolean);
  if (value && typeof value === 'object') return Object.values(value);
  return [];
};

const Row = ({ label, value }) => (
  <tr>
    <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #e2e8f0', width: '35%' }}>{label}</th>
    <td style={{ padding: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>{value ?? '—'}</td>
  </tr>
);

export default function OpportunityDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    opportunitiesApi.get(id)
      .then((data) => {
        if (data.success) setItem(data.item);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading">Loading opportunity...</div>;
  if (!item) return <div className="exams-page">Opportunity not found.</div>;

  const skills = asList(item.requiredSkills);
  const qualifications = asList(item.educationalQualifications);
  const experience = item.experienceRequired || {};
  const minYears = experience.minimumYears ?? experience.minYears;
  const prefYears = experience.preferredYears ?? experience.maxYears;

  return (
    <div className="exams-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <h1 className="exams-title" style={{ marginBottom: '0.25rem' }}>{item.title}</h1>
          <div style={{ color: '#7180ac', fontSize: '0.9rem' }}>{item.organization}</div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/opportunities')}>Back</button>
          <button className="btn btn-primary" onClick={() => navigate(`/opportunities/${item._id}/apply`)}>Apply Now</button>
        </div>
      </div>

      <div className="exam-card">
        <div className="card-body">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <Row label="Type" value={item.opportunityType} />
              <Row label="Status" value={item.status} />
              <Row label="Location" value={item.location} />
              <Row label="Work Model" value={item.workModel} />
              <Row label="Age Range" value={item.minAge && item.maxAge ? `${item.minAge} – ${item.maxAge}` : '—'} />
              <Row label="Experience" value={minYears ? `${minYears} yr min${prefYears ? `, ${prefYears} yr preferred` : ''}` : '—'} />
              <Row label="Application Deadline" value={item.applicationDeadline ? new Date(item.applicationDeadline).toLocaleDateString() : '—'} />
              <Row label="Verification" value={item.verificationStatus} />
            </tbody>
          </table>
        </div>
      </div>

      {item.description && (
        <div className="exam-card" style={{ marginTop: '1rem' }}>
          <div className="card-header"><span className="card-title">Description</span></div>
          <div className="card-body">
            <p style={{ whiteSpace: 'pre-wrap', margin: 0, color: '#4a5568' }}>{item.description}</p>
          </div>
        </div>
      )}

      {qualifications.length > 0 && (
        <div className="exam-card" style={{ marginTop: '1rem' }}>
          <div className="card-header"><span className="card-title">Educational Qualifications</span></div>
          <div className="card-body">
            <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#4a5568' }}>
              {qualifications.map((q, i) => (
                <li key={i}>
                  {typeof q === 'object' ? `${q.qualification || JSON.stringify(q)}${q.required === false ? ' (preferred)' : ''}` : String(q)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {skills.length > 0 && (
        <div className="exam-card" style={{ marginTop: '1rem' }}>
          <div className="card-header"><span className="card-title">Required Skills</span></div>
          <div className="card-body">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {skills.map((s, i) => (
                <span key={i} className="exam-badge exam-badge-closed">{typeof s === 'object' ? (s.name || JSON.stringify(s)) : s}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {item.requiredDocuments && Object.keys(item.requiredDocuments).length > 0 && (
        <div className="exam-card" style={{ marginTop: '1rem' }}>
          <div className="card-header"><span className="card-title">Documents Required</span></div>
          <div className="card-body">
            <pre style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', overflowX: 'auto', margin: 0 }}>
              {JSON.stringify(item.requiredDocuments, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

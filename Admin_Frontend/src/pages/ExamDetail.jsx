import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi, ApiError } from '../api/adminApi';
import { useToast } from '../components/Toast';
import { formatDateTime } from '../utils/format';

const Section = ({ title, children }) => (
  children ? (
    <div className="card" style={{ marginTop: '1.5rem' }}>
      <div className="card-header"><span className="card-title">{title}</span></div>
      <div className="card-body">{children}</div>
    </div>
  ) : null
);

const Row = ({ label, value }) => (
  <tr>
    <th style={{ width: '40%' }}>{label}</th>
    <td>{value ?? '—'}</td>
  </tr>
);

const maybeDate = (v) => (v ? formatDateTime(v) : '—');

export default function ExamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminApi.exams.get(id).then(setData).catch((err) => {
      addToast(err instanceof ApiError ? err.message : 'Failed to load exam', 'error');
    }).finally(() => setLoading(false));
  }, [id]);

  const exam = data?.item;

  if (loading) return <div className="loading">Loading...</div>;
  if (!exam) return null;

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <span className="card-title">Exam Details</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-sm btn-secondary" onClick={() => navigate(`/exams/${exam._id}/edit`)}>Edit</button>
            <button className="btn btn-sm btn-secondary" onClick={() => navigate('/exams')}>Back</button>
          </div>
        </div>
        <div className="card-body">
          <table className="table">
            <tbody>
              <Row label="Exam Name" value={exam.examName} />
              <Row label="Exam Body" value={exam.examBody} />
              <Row label="Official Website" value={exam.officialWebsite ? <a href={exam.officialWebsite} target="_blank" rel="noreferrer">{exam.officialWebsite}</a> : null} />
              <Row label="Category" value={exam.examCategory} />
              <Row label="Type" value={exam.examType} />
              <Row label="Mode" value={exam.examMode} />
              <Row label="Status" value={exam.status} />
              <Row label="Active" value={exam.isActive ? 'Yes' : 'No'} />
            </tbody>
          </table>
        </div>
      </div>

      <Section title="Application">
        <table className="table">
          <tbody>
            <Row label="Total Vacancies" value={exam.totalVacancies} />
            <Row label="Application Fee" value={exam.applicationFee} />
            <Row label="Application Start Date" value={maybeDate(exam.applicationStartDate)} />
            <Row label="Application Deadline" value={maybeDate(exam.applicationDeadline)} />
            <Row label="Notification Sent" value={exam.notificationSent ? 'Yes' : 'No'} />
          </tbody>
        </table>
      </Section>

      <Section title="Schedule">
        <table className="table">
          <tbody>
            <Row label="Exam Date" value={maybeDate(exam.examDate)} />
            <Row label="Result Date" value={maybeDate(exam.resultDate)} />
            <Row label="Duration (minutes)" value={exam.durationMinutes} />
            <Row label="Score Validity (Years)" value={exam.scoreValidityYears} />
          </tbody>
        </table>
      </Section>

      <Section title="Marks & Criteria">
        <table className="table">
          <tbody>
            <Row label="Total Marks" value={exam.totalMarks} />
            <Row label="Cutoff Marks" value={exam.cutoffMarks} />
            <Row label="Negative Marking" value={exam.negativeMarking ? 'Yes' : 'No'} />
            <Row label="Negative Marking Value" value={exam.negativeMarkingValue} />
            <Row label="Attempts Allowed" value={exam.numberOfAttemptsAllowed} />
          </tbody>
        </table>
        {exam.subjects && Object.keys(exam.subjects).length > 0 && (
          <div className="json-viewer">{JSON.stringify(exam.subjects, null, 2)}</div>
        )}
      </Section>

      <Section title="Eligibility">
        <table className="table">
          <tbody>
            <Row label="Age Relaxation" value={exam.ageRelaxation ? <pre className="json-viewer">{JSON.stringify(exam.ageRelaxation, null, 2)}</pre> : '—'} />
            <Row label="Educational Qualifications" value={exam.educationalQualifications ? <pre className="json-viewer">{JSON.stringify(exam.educationalQualifications, null, 2)}</pre> : '—'} />
            <Row label="Physical Requirements" value={exam.physicalRequirements ? <pre className="json-viewer">{JSON.stringify(exam.physicalRequirements, null, 2)}</pre> : '—'} />
            <Row label="Eligibility Rules" value={exam.eligibilityRules ? <pre className="json-viewer">{JSON.stringify(exam.eligibilityRules, null, 2)}</pre> : '—'} />
          </tbody>
        </table>
      </Section>

      <Section title="Audit">
        <table className="table">
          <tbody>
            <Row label="Created" value={maybeDate(exam.createdAt)} />
            <Row label="Updated" value={maybeDate(exam.updatedAt)} />
          </tbody>
        </table>
      </Section>
    </div>
  );
}

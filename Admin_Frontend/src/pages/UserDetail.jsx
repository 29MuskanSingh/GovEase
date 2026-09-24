import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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

export default function UserDetail() {
  const { id } = useParams();
  const { addToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminApi.users.get(id).then(setData).catch((err) => {
      addToast(err instanceof ApiError ? err.message : 'Failed to load user', 'error');
    }).finally(() => setLoading(false));
  }, [id]);

  const user = data?.user;
  const profile = data?.profile;
  const address = data?.address;
  const identity = data?.identity;
  const education = data?.education;
  const experience = data?.experience || [];
  const skills = data?.skills || [];
  const certifications = data?.certifications || [];
  const documents = data?.documents || [];

  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return null;

  return (
    <div>
      <div className="card">
        <div className="card-header"><span className="card-title">Account</span></div>
        <div className="card-body">
          <table className="table">
            <tbody>
              <tr><th>User ID</th><td>{user._id}</td><th>Role</th><td>{user.role}</td></tr>
              <tr><th>Full Name</th><td>{user.fullName || '—'}</td><th>Email</th><td>{user.email}</td></tr>
              <tr><th>Phone</th><td>{user.phone || '—'}</td><th>Status</th><td>{user.status}</td></tr>
              <tr><th>Email Verified</th><td>{user.emailVerified ? 'Yes' : 'No'}</td><th>Created</th><td>{formatDateTime(user.createdAt)}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <Section title="Profile">
        <table className="table">
          <tbody>
            <tr><th>Father Name</th><td>{profile?.fatherName || '—'}</td><th>Mother Name</th><td>{profile?.motherName || '—'}</td></tr>
            <tr><th>Date of Birth</th><td>{profile?.dateOfBirth ? formatDateTime(profile.dateOfBirth) : '—'}</td><th>Age</th><td>{profile?.age || '—'}</td></tr>
            <tr><th>Gender</th><td>{profile?.gender || '—'}</td><th>Blood Group</th><td>{profile?.bloodGroup || '—'}</td></tr>
            <tr><th>Profession</th><td>{profile?.profession || '—'}</td><th>Category</th><td>{profile?.category || '—'}</td></tr>
            <tr><th>Income</th><td>{profile?.income || '—'}</td><th>Completeness</th><td>{profile?.completenessScore ?? '—'}%</td></tr>
            <tr><th>Disability</th><td>{profile?.disability?.hasDisability ? `${profile.disability.type || ''} (${profile.disability.percentage || 0}%)` : 'No'}</td><td></td></tr>
          </tbody>
        </table>
      </Section>

      <Section title="Address">
        <table className="table">
          <tbody>
            <tr><th>Village/Town</th><td>{address?.villageTown || '—'}</td><th>District</th><td>{address?.district || '—'}</td></tr>
            <tr><th>Pin Code</th><td>{address?.pinCode || '—'}</td><th>City</th><td>{address?.city || '—'}</td></tr>
            <tr><th>State</th><td>{address?.state || '—'}</td><th>Country</th><td>{address?.country || '—'}</td></tr>
          </tbody>
        </table>
      </Section>

      <Section title="Identity">
        <table className="table">
          <tbody>
            {(identity?.ids || []).map((idDoc, index) => (
              <tr key={index}>
                <th>{idDoc.idType} #{index + 1}</th>
                <td>{idDoc.idNumber}</td>
                <th>Verified</th>
                <td>{idDoc.verified ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="Education">
        {education ? (
          <table className="table">
            <tbody>
              <tr><th>Type</th><td>{education.educationType || '—'}</td><th>Institution</th><td>{education.institution || '—'}</td></tr>
              <tr><th>Board/University</th><td>{education.boardUniversity || '—'}</td><th>Degree</th><td>{education.degree || '—'}</td></tr>
              <tr><th>Passing Year</th><td>{education.passingYear || '—'}</td><th>Percentage/CGPA</th><td>{education.percentageCgpa || '—'}</td></tr>
            </tbody>
          </table>
        ) : <p style={{ color: 'var(--gray-500)' }}>No education information</p>}
      </Section>

      <Section title="Experience">
        {experience.length ? (
          <table className="table">
            <thead><tr><th>Organization</th><th>Role</th><th>Start</th><th>End</th><th>Status</th></tr></thead>
            <tbody>
              {experience.map((exp) => (
                <tr key={exp._id}>
                  <td>{exp.organization}</td><td>{exp.role || '—'}</td>
                  <td>{formatDateTime(exp.startDate)}</td>
                  <td>{exp.currentlyWorking ? 'Present' : formatDateTime(exp.endDate)}</td>
                  <td>{exp.employmentStatus || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p style={{ color: 'var(--gray-500)' }}>No experience information</p>}
      </Section>

      <Section title="Skills">
        {skills.length ? (
          <table className="table">
            <thead><tr><th>Type</th><th>Name</th><th>Proficiency</th></tr></thead>
            <tbody>
              {skills.map((skill) => (
                <tr key={skill._id}>
                  <td>{skill.skillType}</td><td>{skill.name}</td><td>{skill.proficiency || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p style={{ color: 'var(--gray-500)' }}>No skills recorded</p>}
      </Section>

      <Section title="Certifications">
        {certifications.length ? (
          <table className="table">
            <thead><tr><th>Name</th><th>Organization</th><th>Credential ID</th></tr></thead>
            <tbody>
              {certifications.map((cert) => (
                <tr key={cert._id}>
                  <td>{cert.name}</td><td>{cert.issuingOrganization}</td><td>{cert.credentialId || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p style={{ color: 'var(--gray-500)' }}>No certifications recorded</p>}
      </Section>

      <Section title="Documents">
        {documents.length ? (
          <table className="table">
            <thead><tr><th>Type</th><th>File</th><th>Status</th><th>Uploaded</th></tr></thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc._id}>
                  <td>{doc.documentType || '—'}</td>
                  <td>{doc.fileName || '—'}</td>
                  <td>{doc.verificationStatus || 'Unverified'}</td>
                  <td>{formatDateTime(doc.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p style={{ color: 'var(--gray-500)' }}>No documents uploaded</p>}
      </Section>

      <Section title="Preferences">
        {data?.preferences ? (
          <table className="table">
            <tbody>
              <tr><th>Hobbies</th><td>{(data.preferences.hobbies || []).join(', ') || '—'}</td></tr>
              <tr><th>Interests</th><td>{(data.preferences.interests || []).join(', ') || '—'}</td></tr>
              <tr><th>Languages</th><td>{(data.preferences.preferredLanguages || []).join(', ') || '—'}</td></tr>
              <tr><th>Salary Range</th><td>{data.preferences.salaryRange?.min || 0} – {data.preferences.salaryRange?.max || 0}</td></tr>
            </tbody>
          </table>
        ) : <p style={{ color: 'var(--gray-500)' }}>No preferences recorded</p>}
      </Section>
    </div>
  );
}

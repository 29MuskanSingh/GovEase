import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { examsApi } from '../api/examsApi';
import { profileApi, educationApi, documentApi, identityApi, certificationApi } from '../api/profileApi';
import { useAuth } from '../context/AuthContext';
import './../pages/ExamsPage.css';

const fieldTypeLabel = (type) => {
  const map = {
    text: 'Text', email: 'Email', number: 'Number', textarea: 'Textarea',
    select: 'Select', radio: 'Radio', checkbox: 'Checkbox', date: 'Date',
    image: 'Image', signature: 'Signature', file: 'File'
  };
  return map[type] || type;
};

const fileToDataURL = (file) => new Promise((resolve) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.readAsDataURL(file);
});

export default function DynamicFormRenderer({ onSubmit }) {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const [form, setForm] = useState(null);
  const [formError, setFormError] = useState(null);
  const [values, setValues] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [authRequired, setAuthRequired] = useState(false);

  useEffect(() => {
    if (!id) return;
    examsApi.getForm(id)
      .then((data) => {
        if (data.success) {
          setForm(data.item);
          setFormError(null);
          const initial = {};
          (data.item.fields || []).forEach((f) => {
            if (f.defaultValue !== undefined) initial[f.key] = f.defaultValue;
          });
          setValues(initial);
        } else if (data.status === 401) {
          setAuthRequired(true);
          setFormError(data.message || 'Authentication required');
        } else {
          setFormError(data.message || 'Failed to load form');
        }
      })
      .catch(() => setFormError('Failed to load form'));
  }, [id]);

  useEffect(() => {
    if (form && isAuthenticated && user?._id) {
      autofillFromProfile(user._id);
    }
  }, [form, isAuthenticated, user]);

  const handleChange = useCallback((key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const autofillFromProfile = useCallback(async (userId) => {
    try {
      const profileRes = await profileApi.get(userId).catch(() => ({ success: false }));
      const educationRes = await educationApi.getAll(userId).catch(() => ({ success: false }));
      const documentsRes = await documentApi.getAll(userId).catch(() => ({ success: false }));
      const identityRes = await identityApi.get(userId).catch(() => ({ success: false }));

      const profile = profileRes.profile;
      const address = profileRes.address;
      const educationList = educationRes.educations || [];
      const documents = documentsRes.documents || [];
      const identities = identityRes.ids || [];

      const firstUnderGrad = educationList.find((e) => e.educationType === 'Under-Graduate') || educationList[0];

      const degreeToOption = (degree) => {
        if (!degree) return undefined;
        const d = degree.toLowerCase();
        if (d.includes('bca')) return 'BCA_4yr';
        if (d.includes("b.e") || d.includes("b.tech") || d.includes('be/btech') || d.includes('engineering')) return 'BE_BTech';
        return 'Other';
      };

      const imageDocValue = (docTypeLabel) => {
        const doc = documents.find((d) => d.documentType === docTypeLabel);
        return doc ? documentApi.getFileUrl(doc._id) : undefined;
      };

      setValues((prev) => ({
        ...prev,
        fullName: profile?.fullName ?? prev.fullName,
        email: profile?.email ?? prev.email,
        phone: profile?.phoneNumber ?? prev.phone,
        dateOfBirth: profile?.dateOfBirth ?? prev.dateOfBirth,
        gender: profile?.gender ?? prev.gender,
        degree: degreeToOption(firstUnderGrad?.degree || firstUnderGrad?.course) ?? prev.degree,
        passingYear: firstUnderGrad?.passingYear ?? prev.passingYear,
        percentage: firstUnderGrad?.percentageCgpa ?? prev.percentage,
        discipline: (firstUnderGrad?.specialization || firstUnderGrad?.stream || '').toLowerCase().includes('computer') || (firstUnderGrad?.specialization || firstUnderGrad?.stream || '').toLowerCase().includes('it')
          ? 'CS' : prev.discipline,
        preferredCity: address?.city || address?.district || prev.preferredCity,
        photo: imageDocValue('Passport Photo') ?? prev.photo,
        signature: imageDocValue('Signature') ?? prev.signature
      }));
    } catch (err) {
      // non-fatal: leave form empty for manual entry
      console.warn('Auto-fill failed:', err);
    }
  }, []);

  const handleFile = useCallback(async (field, file) => {
    if (!file) return;
    if (['image', 'signature'].includes(field.type)) {
      try {
        const dataUrl = await fileToDataURL(file);
        if (field.isMultiple) {
          const current = Array.isArray(values[field.key]) ? values[field.key] : [];
          handleChange(field.key, [...current, dataUrl]);
        } else {
          handleChange(field.key, dataUrl);
        }
      } catch { /* ignore */ }
    } else {
      const text = await file.text();
      handleChange(field.key, { name: file.name, type: file.type, size: file.size, content: text });
    }
  }, [values, handleChange]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (onSubmit) return onSubmit(values);
    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 300));
      alert('Submission received (demo). Connect an endpoint to persist responses.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return <div className="exams-page"><p>Please log in to apply for exams.</p></div>;
  }

  if (!form) {
    return <div className="loading">{formError ? `Form error: ${formError}` : 'Loading application form...'}</div>;
  }

  const renderField = (field) => {
    const value = values[field.key];
    const common = {
      className: 'form-input',
      required: field.required,
      style: { width: '100%' }
    };

    switch (field.type) {
      case 'textarea':
        return <textarea {...common} rows={4} value={value ?? ''} onChange={(e) => handleChange(field.key, e.target.value)} />;
      case 'number':
        return <input type="number" {...common} value={value ?? ''} onChange={(e) => handleChange(field.key, e.target.value ? Number(e.target.value) : undefined)} />;
      case 'date':
        return <input type="date" {...common} value={value ? new Date(value).toISOString().slice(0, 10) : ''} onChange={(e) => handleChange(field.key, e.target.value)} />;
      case 'email':
        return <input type="email" {...common} value={value ?? ''} onChange={(e) => handleChange(field.key, e.target.value)} />;
      case 'select':
        return (
          <select {...common} value={value ?? ''} onChange={(e) => handleChange(field.key, e.target.value)}>
            <option value="">Select...</option>
            {(field.options || []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        );
      case 'radio':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            {(field.options || []).map((o) => (
              <label key={o.value} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="radio" name={field.key} value={o.value} checked={value === o.value} onChange={() => handleChange(field.key, o.value)} />
                <span>{o.label}</span>
              </label>
            ))}
          </div>
        );
      case 'checkbox':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            {(field.options || []).map((o) => {
              const checked = field.isMultiple
                ? Array.isArray(value) && value.includes(o.value)
                : value === o.value;
              return (
                <label key={o.value} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      if (field.isMultiple) {
                        const arr = Array.isArray(value) ? [...value] : [];
                        if (e.target.checked) { if (!arr.includes(o.value)) arr.push(o.value); }
                        else arr.splice(arr.indexOf(o.value), 1);
                        handleChange(field.key, arr);
                      } else {
                        handleChange(field.key, e.target.checked ? o.value : undefined);
                      }
                    }}
                  />
                  <span>{o.label}</span>
                </label>
              );
            })}
          </div>
        );
      case 'image':
      case 'signature':
      case 'file':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <input type="file" accept={['image', 'signature'].includes(field.type) ? 'image/*' : '*'} onChange={(e) => handleFile(field, e.target.files[0])} />
            {value && (
              <div>
                {field.isMultiple ? value.map((v, i) => renderPreview(field, v, i)) : renderPreview(field, value, 0)}
              </div>
            )}
          </div>
        );
      case 'text':
      default:
        return <input type="text" {...common} value={value ?? ''} onChange={(e) => handleChange(field.key, e.target.value)} />;
    }
  };

  const renderPreview = (field, url, i) => {
    if (['image', 'signature'].includes(field.type) && typeof url === 'string' && url.startsWith('data:image/')) {
      return <img key={i} src={url} alt={`${field.label} preview`} style={{ maxWidth: '100%', maxHeight: 160, borderRadius: '8px', border: '1px solid #e2e8f0' }} />;
    }
    return <span key={i} style={{ fontSize: '0.8rem' }}>{typeof url === 'string' ? url.slice(0, 60) : url?.name}</span>;
  };

  const orderedFields = [...(form.fields || [])].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  return (
    <div className="exams-page">
      <h1 className="exams-title">{form.title || 'Application Form'}</h1>
      {form.description && <p style={{ color: '#4a5568', marginBottom: '1rem' }}>{form.description}</p>}

      <form onSubmit={handleSubmit}>
        <div className="exam-card">
          <div className="card-body">
            <div className="form-row">
              {orderedFields.map((field) => (
                <div key={field.fieldId} className="form-field" style={{ flex: field.width === 'half' ? '0 0 48%' : field.width === 'third' ? '0 0 31%' : '1 1 100%', marginBottom: '1rem' }}>
                  <label className="form-label">
                    {field.label}
                    {field.required && ' *'}
                  </label>
                  {renderField(field)}
                  {field.helpText && <span style={{ fontSize: '0.75rem', color: '#7180ac' }}>{field.helpText}</span>}
                </div>
              ))}
            </div>

            {form.eligibilityRules ? null : null}

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Submitting...' : (onSubmit ? 'Submit' : 'Submit Application')}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => window.history.back()}>Back</button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

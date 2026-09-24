import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { adminApi, ApiError } from '../api/adminApi';
import { useToast } from '../components/Toast';
import { formatDateTime } from '../utils/format';

const Empty = () => null;

const InputField = ({ field, value, onChange, isPreview }) => {
  const common = {
    className: 'form-input',
    value: value ?? '',
    onChange: isPreview ? undefined : (e) => onChange(field.key, e.target.value),
    required: field.required,
    placeholder: field.placeholder,
    style: { width: '100%' }
  };

  switch (field.type) {
    case 'textarea':
      return <textarea {...common} rows={4} />;
    case 'number':
      return <input type="number" {...common} min={field.min} step={field.step} />;
    case 'date':
      return <input type="date" {...common} />;
    case 'email':
      return <input type="email" {...common} />;
    case 'select':
      return (
        <select {...common}>
          <option value="">Select...</option>
          {(field.options || []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
    case 'radio':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          {(field.options || []).map((o) => (
            <label key={o.value} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="radio" name={field.key} value={o.value} checked={value === o.value} onChange={isPreview ? undefined : () => onChange(field.key, o.value)} disabled={isPreview} />
              <span>{o.label}</span>
            </label>
          ))}
        </div>
      );
    case 'checkbox':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          {(field.options || []).map((o) => {
            const checked = Array.isArray(value) ? value.includes(o.value) : value === o.value;
            return (
              <label key={o.value} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" name={field.key} value={o.value} checked={checked}
                  onChange={isPreview ? undefined : (e) => {
                    const arr = Array.isArray(value) ? [...value] : [];
                    if (e.target.checked) { if (!arr.includes(o.value)) arr.push(o.value); }
                    else arr.splice(arr.indexOf(o.value), 1);
                    onChange(field.key, arr);
                  }} disabled={isPreview} />
                <span>{o.label}</span>
              </label>
            );
          })}
        </div>
      );
    case 'text':
    default:
      return <input type="text" {...common} />;
  }
};

const MediaField = ({ field, value }) => {
  const urls = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split('\n').filter(Boolean)
      : [];
  return urls.length > 0 ? (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      {urls.map((url, i) => (
        <img key={i} src={url.trim()} alt={field.label} style={{ maxWidth: '100%', maxHeight: 160, borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)' }} />
      ))}
    </div>
  ) : <span style={{ color: 'var(--gray-500)' }}>— No {field.label} uploaded —</span>;
};

const FileField = ({ field, value }) => {
  const urls = Array.isArray(value) ? value : typeof value === 'string' ? value.split('\n').filter(Boolean) : [];
  return urls.length > 0 ? (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {urls.map((url, i) => (
        <li key={i}><a href={url.trim()} target="_blank" rel="noreferrer">{url.trim()}</a></li>
      ))}
    </ul>
  ) : <span style={{ color: 'var(--gray-500)' }}>— No file uploaded —</span>;
};

export default function DynamicFormRenderer({ formId, readOnly = true, initialData = {}, onSubmit, submitLabel = 'Submit' }) {
  const params = useParams();
  const resolvedId = formId || params?.id;
  const { addToast } = useToast();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState(initialData);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!resolvedId) return;
    setLoading(true);
    adminApi.forms.get(resolvedId).then((data) => {
      setForm(data.item);
      setValues((prev) => ({ ...(data.item.defaultValues || {}), ...prev }));
    }).catch((err) => {
      addToast(err instanceof ApiError ? err.message : 'Failed to load form', 'error');
    }).finally(() => setLoading(false));
  }, [resolvedId]);

  if (loading) return <div className="loading">Loading form...</div>;
  if (!form) return <div className="loading">No form selected</div>;

  const orderedFields = [...(form.fields || [])].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  const renderField = (field) => {
    const value = values[field.key];
    if (['image', 'signature'].includes(field.type)) {
      return <MediaField field={field} value={value} />;
    }
    if (field.type === 'file') {
      return <FileField field={field} value={value} />;
    }
    return <InputField field={field} value={value} onChange={(k, v) => setValues((prev) => ({ ...prev, [k]: v }))} isPreview={readOnly} />;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (onSubmit) return onSubmit(values);
    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 200));
      addToast('Submission successful', 'success');
    } catch (err) {
      addToast('Submission failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="resource-form" onSubmit={handleSubmit}>
      <div className="card">
        <div className="card-header"><span className="card-title">{form.title}</span></div>
        <div className="card-body">
          {form.description && <p style={{ color: 'var(--gray-600)', marginBottom: '1rem' }}>{form.description}</p>}
          <div className="form-row">
            {orderedFields.map((field) => (
              <div key={field.fieldId} className="form-field" style={{ flex: field.width === 'half' ? '0 0 48%' : field.width === 'third' ? '0 0 31%' : '1 1 100%' }}>
                <label className="form-label">
                  {field.label}
                  {field.required && ' *'}
                  {field.helpText && <span style={{ color: 'var(--gray-500)', fontWeight: 'normal' }}> — {field.helpText}</span>}
                </label>
                {renderField(field)}
              </div>
            ))}
          </div>
        </div>
      </div>
      {!readOnly && (
        <div style={{ marginTop: '1.5rem' }}>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Submitting...' : submitLabel}
          </button>
        </div>
      )}
      <div style={{ marginTop: '2rem', color: 'var(--gray-500)', fontSize: '0.8rem' }}>
        Last updated: {formatDateTime(form.updatedAt)}
      </div>
    </form>
  );
}

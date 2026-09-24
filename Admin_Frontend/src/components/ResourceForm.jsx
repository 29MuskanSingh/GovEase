import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from './Toast';
import { ApiError } from '../api/adminApi';

const isSection = (field) => Array.isArray(field?.fields);
const flatFields = (fields) => fields.flatMap((f) => isSection(f) ? f.fields : f);

const formatDateValue = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
};

const parsePayload = (values, fields) => {
  const payload = {};
  for (const field of flatFields(fields)) {
    if (!(field.name in values)) continue;
    const raw = values[field.name];
    if (field.type === 'json') {
      if (!raw || raw.trim() === '') { payload[field.name] = {}; continue; }
      try { payload[field.name] = JSON.parse(raw); } catch {
        throw new Error(`"${field.label}" is not valid JSON`);
      }
    } else if (field.type === 'number') {
      payload[field.name] = raw === '' || raw === undefined ? undefined : Number(raw);
    } else if (field.type === 'boolean') {
      payload[field.name] = Boolean(raw);
    } else if (field.type === 'date') {
      payload[field.name] = raw ? new Date(raw).toISOString() : undefined;
    } else {
      payload[field.name] = raw;
    }
  }
  return payload;
};

const renderField = (field, values, handleChange) => {
  const value = values[field.name] ?? '';
  if (field.type === 'boolean') {
    return (
      <label key={field.name} className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => handleChange(field, e.target.checked)}
        />
        <span className="form-label" style={{ marginBottom: 0 }}>{field.label}</span>
      </label>
    );
  }
  if (field.type === 'select') {
    return (
      <div className="form-group" key={field.name}>
        <label className="form-label">{field.label}{field.required && ' *'}</label>
        <select className="form-input" value={value} onChange={(e) => handleChange(field, e.target.value)}>
          <option value="">Select...</option>
          {field.options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </div>
    );
  }
  if (field.type === 'textarea' || field.type === 'json') {
    return (
      <div className="form-group" key={field.name}>
        <label className="form-label">{field.label}{field.required && ' *'}</label>
        <textarea
          className="form-input form-textarea"
          value={value}
          onChange={(e) => handleChange(field, e.target.value)}
          rows={field.type === 'json' ? 4 : 3}
        />
      </div>
    );
  }
  return (
    <div className="form-group" key={field.name}>
      <label className="form-label">{field.label}{field.required && ' *'}</label>
      <input
        className="form-input"
        type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
        value={value}
        min={field.type === 'number' ? 0 : undefined}
        onChange={(e) => handleChange(field, field.type === 'number' ? e.target.value : e.target.value)}
        required={field.required}
      />
    </div>
  );
};

const renderSection = (section, values, handleChange) => (
  <div className="form-section" key={section.title || 'section'}>
    {section.title && <h3 className="form-section-title">{section.title}</h3>}
    <div className="form-row">
      {section.fields.map((field) => (
        <div key={field.name} className="form-field">
          {renderField(field, values, handleChange)}
        </div>
      ))}
    </div>
  </div>
);

const renderFields = (fields, values, handleChange) =>
  fields.map((field) => (isSection(field) ? renderSection(field, values, handleChange) : renderField(field, values, handleChange)));

export default function ResourceForm({ title, fields, load, create, update, addPath }) {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    load(id).then((response) => {
      const item = response.item || response;
      const initial = {};
      for (const field of flatFields(fields)) {
        let value = item?.[field.name];
        if (field.type === 'json' && value && typeof value === 'object') {
          value = JSON.stringify(value, null, 2);
        } else if (field.type === 'date' && value) {
          value = formatDateValue(value);
        }
        initial[field.name] = value ?? '';
      }
      setValues(initial);
    }).catch((err) => {
      addToast(err instanceof ApiError ? err.message : 'Failed to load record', 'error');
    }).finally(() => setLoading(false));
  }, [id]);

  const handleChange = (field, value) => {
    setValues(prev => ({ ...prev, [field.name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = parsePayload(values, fields);
      if (isEdit) {
        await update(id, payload);
      } else {
        await create(payload);
      }
      addToast(title, 'success');
      navigate(addPath);
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : 'Operation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <form className="resource-form" onSubmit={handleSubmit}>
      <div className="card">
        <div className="card-header"><span className="card-title">{title}</span></div>
        <div className="card-body">
          {renderFields(fields, values, handleChange)}
        </div>
      </div>
      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => navigate(addPath)}>Cancel</button>
      </div>
    </form>
  );
}

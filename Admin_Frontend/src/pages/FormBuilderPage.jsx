import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { adminApi, ApiError } from '../api/adminApi';
import useFormBuilder, { FIELD_TYPES } from '../components/FormBuilder';
import { blankField } from '../components/FormBuilder';

const widthOptions = [
  { value: 'full', label: 'Full width' },
  { value: 'half', label: 'Half width' },
  { value: 'third', label: 'Third width' }
];

const imageTypeOptions = [
  { value: 'image/jpeg', label: 'JPEG' },
  { value: 'image/png', label: 'PNG' },
  { value: 'image/gif', label: 'GIF' },
  { value: 'image/webp', label: 'WebP' },
  { value: 'image/svg+xml', label: 'SVG' }
];

export default function FormBuilderPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  const { state, handlers, payload } = useFormBuilder({ initial: null });
  const { title, description, exam, fields, selectedIndex } = state;
  const selected = selectedIndex !== null && selectedIndex !== undefined ? fields[selectedIndex] : null;

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    adminApi.forms.get(id).then((data) => {
      handlers.setInitial(data.item);
    }).catch((err) => {
      addToast(err instanceof ApiError ? err.message : 'Failed to load form', 'error');
    }).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = payload();
      if (isEdit) {
        await adminApi.forms.update(id, data);
      } else {
        await adminApi.forms.create(data);
      }
      addToast('Form saved', 'success');
      navigate('/forms');
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : 'Save failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <form className="resource-form" onSubmit={handleSubmit}>
      <div className="card">
        <div className="card-header">
          <span className="card-title">{isEdit ? 'Edit Form' : 'New Dynamic Form'}</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-sm btn-secondary" onClick={() => navigate('/forms')}>Back</button>
            <button className="btn btn-sm btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        <div className="card-body">
          <div className="form-group">
            <label className="form-label">Form Title *</label>
            <input className="form-input" value={title} onChange={(e) => handlers.setTitle(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Exam / Reference</label>
            <input className="form-input" value={exam} onChange={(e) => handlers.setExam(e.target.value)} placeholder="e.g. GATE-CS-2025" />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input form-textarea" value={description} onChange={(e) => handlers.setDescription(e.target.value)} rows={3} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>Fields</h3>
            <button type="button" className="btn btn-primary" onClick={handlers.addField}>+ Add Field</button>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ flex: '2', minWidth: 320 }}>
              {fields.map((field, index) => (
                <div
                  key={field.fieldId}
                  onClick={() => handlers.setSelected(index)}
                  style={{
                    border: index === selectedIndex ? '2px solid var(--primary)' : '1px solid var(--gray-200)',
                    borderRadius: 'var(--radius)',
                    padding: '0.75rem',
                    marginBottom: '0.75rem',
                    background: index === selectedIndex ? 'var(--primary-light)' : 'white',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>{field.label || `Field ${index + 1}`}</strong>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button type="button" className="btn btn-ghost btn-sm" title="Duplicate" onClick={(e) => { e.stopPropagation(); handlers.duplicateField(index); }}>⧉</button>
                      <button type="button" className="btn btn-ghost btn-sm" title="Move up" onClick={(e) => { e.stopPropagation(); handlers.moveField(index, -1); }} disabled={index === 0}>▲</button>
                      <button type="button" className="btn btn-ghost btn-sm" title="Move down" onClick={(e) => { e.stopPropagation(); handlers.moveField(index, 1); }} disabled={index === fields.length - 1}>▼</button>
                      <button type="button" className="btn btn-ghost btn-sm" title="Remove" onClick={(e) => { e.stopPropagation(); handlers.removeField(index); }} style={{ color: 'var(--danger)' }}>✕</button>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--gray-600)' }}>{field.type}</div>
                </div>
              ))}
            </div>

            {selected !== undefined && selected !== null && (
              <div style={{ flex: '1', minWidth: 280 }}>
                <div className="card" style={{ border: '1px solid var(--gray-200)' }}>
                  <div className="card-header"><span className="card-title">Field Properties</span></div>
                  <div className="card-body" style={{ maxHeight: 640, overflowY: 'auto' }}>
                    <div className="form-group">
                      <label className="form-label">Label *</label>
                      <input className="form-input" value={selected.label} onChange={(e) => handlers.updateField(selectedIndex, { label: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Field Key *</label>
                      <input className="form-input" value={selected.key} onChange={(e) => handlers.updateField(selectedIndex, { key: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Type *</label>
                      <select className="form-input" value={selected.type} onChange={(e) => handlers.updateField(selectedIndex, { type: e.target.value })}>
                        {FIELD_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Width</label>
                      <select className="form-input" value={selected.width} onChange={(e) => handlers.updateField(selectedIndex, { width: e.target.value })}>
                        {widthOptions.map((w) => <option key={w.value} value={w.value}>{w.label}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Placeholder</label>
                      <input className="form-input" value={selected.placeholder || ''} onChange={(e) => handlers.updateField(selectedIndex, { placeholder: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Help text</label>
                      <input className="form-input" value={selected.helpText || ''} onChange={(e) => handlers.updateField(selectedIndex, { helpText: e.target.value })} />
                    </div>
                    <label className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input type="checkbox" checked={selected.required} onChange={(e) => handlers.updateField(selectedIndex, { required: e.target.checked })} />
                      <span className="form-label" style={{ marginBottom: 0 }}>Required</span>
                    </label>
                    <label className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input type="checkbox" checked={selected.isMultiple} onChange={(e) => handlers.updateField(selectedIndex, { isMultiple: e.target.checked })} disabled={['image', 'signature', 'file'].includes(selected.type)} />
                      <span className="form-label" style={{ marginBottom: 0, opacity: ['image', 'signature', 'file'].includes(selected.type) ? 0.5 : 1 }}>Allow multiple</span>
                    </label>

                    {['select', 'radio', 'checkbox'].includes(selected.type) && (
                      <div>
                        <label className="form-label">Options</label>
                        {selected.options.map((opt, optIndex) => (
                          <div key={optIndex} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <input className="form-input" placeholder="Label" value={opt.label} onChange={(e) => handlers.updateOption(selectedIndex, optIndex, { label: e.target.value })} />
                            <input className="form-input" placeholder="Value" value={opt.value} onChange={(e) => handlers.updateOption(selectedIndex, optIndex, { value: e.target.value })} />
                            <button type="button" className="btn btn-ghost btn-sm" onClick={() => handlers.removeOption(selectedIndex, optIndex)} style={{ color: 'var(--danger)' }}>✕</button>
                          </div>
                        ))}
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => handlers.addOption(selectedIndex)}>+ Add Option</button>
                      </div>
                    )}

                    {['image', 'signature', 'file'].includes(selected.type) && (
                      <div className="form-group">
                        <label className="form-label">Max file size (bytes)</label>
                        <input className="form-input" type="number" value={selected.maxFileSize || ''} onChange={(e) => handlers.updateField(selectedIndex, { maxFileSize: e.target.value ? Number(e.target.value) : undefined })} />
                        {['image', 'signature'].includes(selected.type) && (
                          <div style={{ marginTop: '0.5rem' }}>
                            <label className="form-label">Allowed image types</label>
                            {imageTypeOptions.map((t) => (
                              <label key={t.value} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <input type="checkbox" checked={selected.allowedImageTypes?.includes(t.value)} onChange={(e) => {
                                  const next = e.target.checked
                                    ? [...(selected.allowedImageTypes || []), t.value]
                                    : (selected.allowedImageTypes || []).filter((v) => v !== t.value);
                                  handlers.updateField(selectedIndex, { allowedImageTypes: next });
                                }} />
                                <span style={{ fontSize: '0.8rem' }}>{t.label}</span>
                              </label>
                            ))}
                          </div>
                        )}
                        <div style={{ marginTop: '0.5rem' }}>
                          <label className="form-label">Upload sample image</label>
                          <input type="file" accept={['image', 'signature'].includes(selected.type) ? 'image/*' : '*'} onChange={(e) => handlers.handleImageUpload(selectedIndex, e.target.files[0])} />
                        </div>
                        {selected.defaultValue ? (
                          <div style={{ marginTop: '0.75rem' }}>
                            {selected.defaultValue.split('\n').map((u, i) => u && (
                              <img key={i} src={u.trim()} alt="preview" style={{ maxWidth: '100%', maxHeight: 120, display: 'block', marginBottom: '0.25rem', borderRadius: 'var(--radius)' }} />
                            ))}
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}

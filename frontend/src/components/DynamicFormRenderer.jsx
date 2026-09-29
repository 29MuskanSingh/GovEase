import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { examsApi } from '../api/examsApi';
import { profileApi, educationApi, experienceApi, skillApi, documentApi, identityApi, certificationApi, preferenceApi } from '../api/profileApi';
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

export default function DynamicFormRenderer({ onSubmit, fetchForm, submitLabel }) {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const [form, setForm] = useState(null);
  const [formError, setFormError] = useState(null);
  const [values, setValues] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [authRequired, setAuthRequired] = useState(false);

  useEffect(() => {
    if (!id) return;
    (fetchForm || examsApi.getForm)(id)
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
  }, [id, fetchForm]);

  useEffect(() => {
    const uid = user?._id || user?.id;
    if (form && isAuthenticated && uid) {
      autofillFromProfile(uid);
    }
  }, [form, isAuthenticated, user]);

  const handleChange = useCallback((key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const autofillFromProfile = useCallback(async (userId) => {
    if (!form || !form.fields) return;
    try {
      const profileRes = await profileApi.get(userId).catch(() => ({ success: false }));
      const educationRes = await educationApi.getAll(userId).catch(() => ({ success: false }));
      const experienceRes = await experienceApi.getAll(userId).catch(() => ({ success: false }));
      const skillRes = await skillApi.getAll(userId).catch(() => ({ success: false }));
      const documentsRes = await documentApi.getAll(userId).catch(() => ({ success: false }));
      const identityRes = await identityApi.get(userId).catch(() => ({ success: false }));

      const profile = profileRes.profile || {};
      const address = profileRes.address || {};
      // NOTE: these APIs return singular keys - `{ education }`, `{ experience }`,
      // `{ identity }`. Reading a plural key yields undefined and silently
      // disables every education/experience/identity auto-fill below.
      const educationList = educationRes.education || [];
      const experienceList = experienceRes.experience || [];
      const skillList = skillRes.skills || [];
      const documents = documentsRes.documents || [];
      const identities = identityRes.identity?.ids || [];

      // Logic to determine currently pursuing or most recently completed education record
      const levelRank = {
        'Phd': 6,
        'Post Graduate': 5,
        'Under-Graduate': 4,
        'Diploma': 3,
        'Higher Secondary': 2,
        'Secondary': 1,
        'Primary': 0
      };

      const currentYear = new Date().getFullYear();

      // Currently pursuing (passingYear missing/>= currentYear AND startingYear present)
      const pursuingList = educationList.filter(e =>
        (!e.passingYear || Number(e.passingYear) >= currentYear) && e.startingYear
      );

      let targetEdu;
      if (pursuingList.length > 0) {
        pursuingList.sort((a, b) => {
          const rankA = levelRank[a.educationType] || 0;
          const rankB = levelRank[b.educationType] || 0;
          if (rankB !== rankA) return rankB - rankA;
          return (Number(b.startingYear) || 0) - (Number(a.startingYear) || 0);
        });
        targetEdu = pursuingList[0];
      } else if (educationList.length > 0) {
        const sorted = [...educationList].sort((a, b) => {
          const passA = Number(a.passingYear) || 0;
          const passB = Number(b.passingYear) || 0;
          if (passB !== passA) return passB - passA;

          const startA = Number(a.startingYear) || 0;
          const startB = Number(b.startingYear) || 0;
          if (startB !== startA) return startB - startA;

          const rankA = levelRank[a.educationType] || 0;
          const rankB = levelRank[b.educationType] || 0;
          return rankB - rankA;
        });
        targetEdu = sorted[0];
      }

      // Helper to map Education Level to option value or standard category string
      const getEducationLevelValue = (options) => {
        if (!targetEdu) return undefined;
        const type = (targetEdu.educationType || '').toLowerCase();
        const deg = (targetEdu.degree || targetEdu.course || '').toLowerCase();

        let standardLevel = targetEdu.educationType;
        if (type.includes('under') || deg.includes('b.tech') || deg.includes('bca') || deg.includes('b.sc') || deg.includes('b.e') || deg.includes('b.a') || deg.includes('b.com')) {
          standardLevel = 'Undergraduate';
        } else if (type.includes('post') || deg.includes('m.tech') || deg.includes('mca') || deg.includes('m.sc') || deg.includes('m.a') || deg.includes('m.com') || deg.includes('mba')) {
          standardLevel = 'Postgraduate';
        } else if (type.includes('phd') || type.includes('doctor') || deg.includes('phd') || deg.includes('doctor')) {
          standardLevel = 'PhD';
        } else if (type.includes('higher') || type.includes('12')) {
          standardLevel = 'Higher Secondary';
        } else if (type.includes('secondary') || type.includes('10')) {
          standardLevel = 'Secondary';
        }

        if (!options || options.length === 0) return standardLevel;

        const lvlLower = standardLevel.toLowerCase();
        const matched = options.find(o => {
          const val = (o.value || '').toLowerCase();
          const lbl = (o.label || '').toLowerCase();
          if (lvlLower.includes('under') && (val.includes('under') || val.includes('grad') || val.includes('ug') || val.includes('bachelor') || lbl.includes('under') || lbl.includes('grad') || lbl.includes('bachelor'))) return true;
          if (lvlLower.includes('post') && (val.includes('post') || val.includes('master') || val.includes('pg') || lbl.includes('post') || lbl.includes('master'))) return true;
          if (lvlLower.includes('phd') && (val.includes('phd') || val.includes('doctor') || lbl.includes('phd') || lbl.includes('doctor'))) return true;
          if (lvlLower.includes('higher') && (val.includes('higher') || val.includes('12') || val.includes('senior') || lbl.includes('higher') || lbl.includes('12'))) return true;
          if (lvlLower.includes('secondary') && !lvlLower.includes('higher') && (val.includes('secondary') || val.includes('10') || lbl.includes('secondary') || lbl.includes('10'))) return true;
          return val === lvlLower || lbl === lvlLower;
        });

        if (matched) return matched.value;
        // Never emit a level that is absent from the option list: a <select>
        // whose value matches no <option> renders blank.
        const fallback = options.find(o => /^(other|any|not\s*listed)$/i.test((o.value || '').trim()) || /^other$/i.test((o.label || '').trim()));
        if (fallback) return fallback.value;
        const exactByRank = options.find(o => lvlLower.includes((o.value || '').toLowerCase().split('-')[0].trim()) || (o.label || '').toLowerCase().includes(lvlLower.split(' ')[0]));
        if (exactByRank) return exactByRank.value;
        return options[0] ? options[0].value : standardLevel;
      };

      // Helper to map Degree to option value or raw string
      const getDegreeValue = (options) => {
        if (!targetEdu) return undefined;
        const deg = targetEdu.degree || targetEdu.course || targetEdu.educationType;
        if (!deg) return undefined;

        if (!options || options.length === 0) return deg;

        const degLower = deg.toLowerCase();
        // "Bachelor of Computer Applications" does not contain the literal "bca"
        const isBCA = degLower.includes('bca') || degLower.includes('bachelor of computer application');
        const isBSc = degLower.includes('b.sc') || degLower.includes('b.sc.') || degLower.includes('bachelor of science');
        const isBEngg = degLower.includes('b.e') || degLower.includes('b.tech') || degLower.includes('btech') || degLower.includes('bachelor of engineering') || degLower.includes('bachelor of technology');
        const matched = options.find(o => {
          const val = (o.value || '').toLowerCase();
          const lbl = (o.label || '').toLowerCase();
          if (val === degLower || lbl === degLower) return true;
          if (isBCA && (val.includes('bca') || lbl.includes('bca'))) return true;
          if (isBEngg && (val.includes('btech') || val.includes('be') || lbl.includes('b.e') || lbl.includes('b.tech') || lbl.includes('bachelor of engineering') || lbl.includes('bachelor of technology'))) return true;
          if (degLower.includes('mca') && (val.includes('mca') || lbl.includes('mca'))) return true;
          if ((degLower.includes('m.e') || degLower.includes('m.tech')) && (val.includes('mtech') || val.includes('me') || lbl.includes('m.e') || lbl.includes('m.tech'))) return true;
          if (isBSc && (val.includes('bsc') || lbl.includes('b.sc') || lbl.includes('bachelor of science'))) return true;
          if (degLower.includes('m.sc') && (val.includes('msc') || lbl.includes('m.sc'))) return true;
          return lbl.includes(degLower) || degLower.includes(lbl);
        });

        if (matched) return matched.value;
        // A select/checkbox group renders blank when the value matches no option,
        // so fall back to an explicit "Other"-style option before using raw text.
        const fallback = options.find(o => /^(other|any|not\s*listed)$/i.test((o.value || '').trim()) || /^other$/i.test((o.label || '').trim()));
        return fallback ? fallback.value : deg;
      };

      const findDocUrl = (typeNames) => {
        const doc = documents.find((d) =>
          typeNames.some((t) =>
            d.documentType?.toLowerCase() === t.toLowerCase() ||
            d.documentType?.toLowerCase().includes(t.toLowerCase())
          )
        );
        return doc ? documentApi.getFileUrl(doc._id) : undefined;
      };

      const findIdentityNumber = (typeNames) => {
        const idObj = identities.find((i) =>
          typeNames.some((t) =>
            i.idType?.toLowerCase() === t.toLowerCase() ||
            i.idType?.toLowerCase().includes(t.toLowerCase())
          )
        );
        return idObj?.idNumber;
      };

      const autoValues = {};

      (form.fields || []).forEach((field) => {
        const key = (field.key || '').toLowerCase().trim();
        const label = (field.label || '').toLowerCase().trim();
        let val;

        // 1. Full Name
        if (key.includes('fullname') || key === 'name' || label.includes('full name') || (label.includes('name') && !label.includes('father') && !label.includes('mother') && !label.includes('school') && !label.includes('inst'))) {
          val = user?.fullName || profile?.fullName;
        }
        // 2. Email Address
        else if (key.includes('email') || label.includes('email')) {
          val = user?.email || profile?.email;
        }
        // 3. Phone Number
        else if (key.includes('phone') || key.includes('mobile') || label.includes('phone') || label.includes('mobile')) {
          if (key.includes('father') || label.includes('father')) val = profile?.fatherPhoneNumber;
          else if (key.includes('mother') || label.includes('mother')) val = profile?.motherPhoneNumber;
          else val = user?.phone || user?.phoneNumber || profile?.phoneNumber || profile?.fatherPhoneNumber;
        }
        // 4. Date of Birth
        else if (key.includes('dob') || key.includes('birth') || label.includes('birth') || label.includes('dob')) {
          if (profile?.dateOfBirth) {
            val = new Date(profile.dateOfBirth).toISOString().slice(0, 10);
          }
        }
        // 5. Gender
        else if (key.includes('gender') || key.includes('sex') || label.includes('gender') || label.includes('sex')) {
          const gen = profile?.gender;
          if (gen && field.options && field.options.length > 0) {
            const opt = field.options.find(o => o.value.toLowerCase() === gen.toLowerCase() || o.label.toLowerCase() === gen.toLowerCase());
            val = opt ? opt.value : gen;
          } else {
            val = gen;
          }
        }
        // 6. Highest Education Level Field
        else if (key.includes('highest') || key.includes('educationlevel') || label.includes('highest education') || label.includes('education level') || label.includes('highest level')) {
          val = getEducationLevelValue(field.options);
        }
        // 7. Degree / Qualification Field
        else if (key.includes('degree') || key.includes('qualification') || label.includes('degree') || label.includes('qualification')) {
          val = getDegreeValue(field.options);
        }
        // 8. Passing Year Field
        else if (key.includes('year') || label.includes('year')) {
          val = targetEdu?.passingYear || targetEdu?.endYear || targetEdu?.startingYear;
        }
        // 9. Percentage / CGPA Field
        else if (key.includes('percentage') || key.includes('cgpa') || key.includes('score') || key.includes('marks') || label.includes('percentage') || label.includes('cgpa') || label.includes('score') || label.includes('marks')) {
          val = targetEdu?.percentageCgpa;
        }
        // 10. Discipline / Stream / Branch Field
        else if (key.includes('discipline') || key.includes('stream') || key.includes('branch') || key.includes('specialization') || label.includes('discipline') || label.includes('stream') || label.includes('branch')) {
          const spec = targetEdu?.specialization || targetEdu?.stream || '';
          if (spec && field.options && field.options.length > 0) {
            const opt = field.options.find(o =>
              o.value.toLowerCase() === spec.toLowerCase() ||
              o.label.toLowerCase().includes(spec.toLowerCase()) ||
              (spec.toLowerCase().includes('computer') && o.value === 'CS') ||
              (spec.toLowerCase().includes('it') && o.value === 'IT')
            );
            val = opt ? opt.value : spec;
          } else {
            val = spec;
          }
        }
        // 11. Total Experience Field
        else if (key.includes('experience') || label.includes('experience') || key.includes('totalexp')) {
          if (experienceList.length > 0) {
            const totalMonths = experienceList.reduce((acc, exp) => acc + (exp.durationMonths || 0), 0);
            val = totalMonths > 0 ? (totalMonths / 12).toFixed(1) : undefined;
          }
        }
        // 12. Current Job Title Field
        else if (key.includes('jobtitle') || key.includes('title') || key.includes('designation') || label.includes('job title') || label.includes('current role') || label.includes('designation')) {
          const currExp = experienceList.find(e => e.currentlyWorking) || experienceList[0];
          val = currExp?.role || profile?.profession;
        }
        // 13. Preferred City / Location Field
        else if (key.includes('city') || key.includes('location') || label.includes('city') || label.includes('location')) {
          const cityVal = address?.city || address?.district;
          if (cityVal && field.options && field.options.length > 0) {
            const opt = field.options.find(o =>
              o.value.toLowerCase() === cityVal.toLowerCase() ||
              o.label.toLowerCase().includes(cityVal.toLowerCase())
            );
            val = opt ? opt.value : cityVal;
          } else {
            val = cityVal;
          }
        }
        // 14. ABC ID
        else if (key.includes('abc') || label.includes('abc')) {
          val = profile?.abcId || findIdentityNumber(['ABC', 'Academic Bank']);
        }
        // 15. Voter ID / Aadhaar / PAN
        else if (key.includes('voter') || label.includes('voter')) {
          if (['image', 'signature', 'file'].includes(field.type)) {
            val = findDocUrl(['Voter Card', 'Voter ID', 'Voter']);
          } else {
            val = findIdentityNumber(['Voter Card', 'Voter ID', 'Voter']);
          }
        }
        else if (key.includes('aadhaar') || label.includes('aadhaar')) {
          if (['image', 'signature', 'file'].includes(field.type)) {
            val = findDocUrl(['Aadhaar Card', 'Aadhaar']);
          } else {
            val = findIdentityNumber(['Aadhaar Card', 'Aadhaar']);
          }
        }
        else if (key.includes('pan') || label.includes('pan')) {
          if (['image', 'signature', 'file'].includes(field.type)) {
            val = findDocUrl(['PAN Card', 'PAN']);
          } else {
            val = findIdentityNumber(['PAN Card', 'PAN']);
          }
        }
        // 16. Candidate Photo / Passport Photo / Photo
        else if (key.includes('photo') || key.includes('image') || label.includes('photo') || label.includes('image') || label.includes('candidate')) {
          if (['image', 'signature', 'file'].includes(field.type)) {
            val = findDocUrl(['Passport Photo', 'Photo', 'Passport', 'Image']);
          }
        }
        // 17. Signature
        else if (key.includes('sign') || label.includes('sign')) {
          if (['image', 'signature', 'file'].includes(field.type)) {
            val = findDocUrl(['Signature']);
          }
        }

        if (val !== undefined && val !== null && val !== '') {
          autoValues[field.key] = val;
        }
      });

      setValues((prev) => ({
        ...prev,
        ...autoValues
      }));
    } catch (err) {
      console.warn('Auto-fill failed:', err);
    }
  }, [form, user]);

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
    if (!url) return null;
    const isImageUrl = typeof url === 'string' && (
      url.startsWith('data:image/') ||
      url.startsWith('blob:') ||
      url.includes('/api/document/file/') ||
      url.match(/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i)
    );

    if (['image', 'signature'].includes(field.type) || isImageUrl) {
      return (
        <div key={i} style={{ marginTop: '0.5rem' }}>
          <img
            src={url}
            alt={`${field.label} preview`}
            style={{
              maxWidth: '200px',
              maxHeight: '140px',
              objectFit: 'contain',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              padding: '4px',
              background: '#ffffff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
            onError={(e) => {
              console.error('Failed to display preview for', field.label, url);
            }}
          />
        </div>
      );
    }
    return (
      <div key={i} style={{ marginTop: '0.25rem', fontSize: '0.85rem', color: '#475569' }}>
        📎 {typeof url === 'string' ? (url.length > 50 ? url.slice(0, 47) + '...' : url) : url?.name}
      </div>
    );
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
                {submitting ? 'Submitting...' : (submitLabel || (onSubmit ? 'Submit' : 'Submit Application'))}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => window.history.back()}>Back</button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

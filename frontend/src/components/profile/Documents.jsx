import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { documentApi } from '../../api/profileApi';

const documentTypes = ['Aadhaar', 'PAN', 'Voter Card', 'Driving License', 'Passport', 'Marksheet', 'Experience Certificate', 'Income Certificate', 'Disability Certificate', 'Birth Certificate', 'Signature', 'Domicile Certificate', 'Resume', 'Other Documents'];

// Types that belong to the "Other Documents" section
const OTHER_DOC_TYPES = ['Resume', 'Other Documents'];

const ACCEPTED_MIME = 'image/jpeg,image/png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

const Documents = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [docType, setDocType] = useState('Aadhaar');
  const [otherFile, setOtherFile] = useState(null);
  const [otherDrag, setOtherDrag] = useState(false);
  const [otherUploading, setOtherUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileRef = useRef(null);
  const otherFileRef = useRef(null);

  useEffect(() => { loadData(); }, [user]);

  const loadData = async () => {
    if (!user) return;
    try { const res = await documentApi.getAll(user._id || user.id); if (res.success) setDocuments(res.documents); } catch (err) { setMessage({ type: 'error', text: 'Failed to load' }); }
    setLoading(false);
  };

  const handleDrag = (e) => { e.preventDefault(); setDragActive(e.type === 'dragenter' || e.type === 'dragover'); };
  const handleDrop = (e) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files[0]) setSelectedFile(e.dataTransfer.files[0]); };
  const handleFile = (e) => { if (e.target.files[0]) setSelectedFile(e.target.files[0]); };

  const handleUpload = async () => {
    if (!selectedFile) { setMessage({ type: 'error', text: 'Please select a file' }); return; }
    if (selectedFile.size > 5 * 1024 * 1024) { setMessage({ type: 'error', text: 'File must be less than 5MB' }); return; }
    setUploading(true); setMessage({ type: '', text: '' });
    const fd = new FormData();
    fd.append('file', selectedFile);
    fd.append('userId', user._id || user.id);
    fd.append('documentType', docType);
    try { const res = await documentApi.upload(fd); if (res.success) { setMessage({ type: 'success', text: 'Uploaded!' }); setSelectedFile(null); loadData(); } else { setMessage({ type: 'error', text: res.message || 'Failed' }); } } catch (err) { setMessage({ type: 'error', text: 'Upload failed' }); }
    setUploading(false);
  };

  const handleDelete = async (id) => { if (!window.confirm('Delete?')) return; await documentApi.delete(id); setMessage({ type: 'success', text: 'Deleted!' }); loadData(); };

  // --- Other Documents / Resume upload ---
  const handleOtherDrag = (e) => { e.preventDefault(); setOtherDrag(e.type === 'dragenter' || e.type === 'dragover'); };
  const handleOtherDrop = (e) => { e.preventDefault(); setOtherDrag(false); if (e.dataTransfer.files[0]) setOtherFile(e.dataTransfer.files[0]); };
  const handleOtherFile = (e) => { if (e.target.files[0]) setOtherFile(e.target.files[0]); };

  const handleResumeUpload = async () => {
    if (!otherFile) { setMessage({ type: 'error', text: 'Please select a resume file' }); return; }
    if (otherFile.size > 5 * 1024 * 1024) { setMessage({ type: 'error', text: 'File must be less than 5MB' }); return; }
    setOtherUploading(true); setMessage({ type: '', text: '' });
    const fd = new FormData();
    fd.append('file', otherFile);
    fd.append('userId', user._id || user.id);
    fd.append('documentType', 'Resume');
    try {
      const res = await documentApi.upload(fd);
      if (res.success) { setMessage({ type: 'success', text: 'Resume uploaded!' }); setOtherFile(null); loadData(); }
      else setMessage({ type: 'error', text: res.message || 'Failed to upload resume' });
    } catch (err) { setMessage({ type: 'error', text: 'Resume upload failed' }); }
    setOtherUploading(false);
  };

  const otherDocuments = documents.filter(d => OTHER_DOC_TYPES.includes(d.documentType));
  const otherCount = otherDocuments.length;

  const statusColor = (s) => { switch (s) { case 'Verified': return '#48bb78'; case 'Pending': return '#ed8936'; case 'Rejected': return '#e53e3e'; default: return '#a0aec0'; } };

  if (loading) return <div className="section-loading">Loading...</div>;

  return (
    <div className="documents-section">
      {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <div className="upload-card">
        <h3>Upload Document</h3>
        <div className="upload-row">
          <div className="form-group"><label>Document Type</label><select value={docType} onChange={(e) => setDocType(e.target.value)}>{documentTypes.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
          <div className={`drop-zone ${dragActive ? 'active' : ''}`} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} onClick={() => fileRef.current?.click()}>
            {selectedFile ? <span className="file-name">{selectedFile.name}</span> : <span>Drop file or click to browse</span>}
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,application/pdf" onChange={handleFile} hidden />
          </div>
          <button className="btn-primary" onClick={handleUpload} disabled={uploading || !selectedFile}>{uploading ? 'Uploading...' : 'Upload'}</button>
        </div>
      </div>

      <div className="upload-card other-documents-card">
        <h3>Other Documents</h3>
        <p className="other-documents-hint">Upload your resume (PDF, DOC or DOCX, max 5MB). You can upload more than one version.</p>
        <div className="upload-row">
          <div className="form-group"><label>Document</label><input type="text" value="Resume" readOnly disabled /></div>
          <div className={`drop-zone ${otherDrag ? 'active' : ''}`} onDragEnter={handleOtherDrag} onDragLeave={handleOtherDrag} onDragOver={handleOtherDrag} onDrop={handleOtherDrop} onClick={() => otherFileRef.current?.click()}>
            {otherFile ? <span className="file-name">{otherFile.name}</span> : <span>Drop resume or click to browse</span>}
            <input ref={otherFileRef} type="file" accept={ACCEPTED_MIME} onChange={handleOtherFile} hidden />
          </div>
          <button className="btn-primary" onClick={handleResumeUpload} disabled={otherUploading || !otherFile}>{otherUploading ? 'Uploading...' : 'Upload Resume'}</button>
        </div>
        {otherCount > 0 ? (
          <div className="doc-grid other-doc-grid">
            {otherDocuments.map(doc => (
              <div key={doc._id} className="doc-card">
                <div className="doc-info"><span className="doc-type">{doc.documentType}</span><span className="doc-name">{doc.fileName}</span><span className="doc-status" style={{ color: statusColor(doc.verificationStatus) }}>{doc.verificationStatus}</span></div>
                <div className="doc-actions"><a href={documentApi.getFileUrl(doc._id)} target="_blank" rel="noopener noreferrer" className="btn-icon view">View</a><button className="btn-icon delete" onClick={() => handleDelete(doc._id)}>Delete</button></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">No resumes uploaded yet.</div>
        )}
      </div>

      <div className="documents-list">
        <h3>Uploaded Documents ({documents.filter(d => !OTHER_DOC_TYPES.includes(d.documentType)).length})</h3>
        {documents.filter(d => !OTHER_DOC_TYPES.includes(d.documentType)).length === 0 ? <div className="empty-state">No documents uploaded.</div> : (
          <div className="doc-grid">
            {documents.filter(d => !OTHER_DOC_TYPES.includes(d.documentType)).map(doc => (
              <div key={doc._id} className="doc-card">
                <div className="doc-info"><span className="doc-type">{doc.documentType}</span><span className="doc-name">{doc.fileName}</span><span className="doc-status" style={{ color: statusColor(doc.verificationStatus) }}>{doc.verificationStatus}</span></div>
                <div className="doc-actions"><a href={documentApi.getFileUrl(doc._id)} target="_blank" rel="noopener noreferrer" className="btn-icon view">View</a><button className="btn-icon delete" onClick={() => handleDelete(doc._id)}>Delete</button></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Documents;

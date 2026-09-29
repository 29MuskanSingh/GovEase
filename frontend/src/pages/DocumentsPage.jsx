import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { documentApi } from '../api/profileApi';
import './DocumentsPage.css';

const DocumentsPage = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({ documentType: 'Aadhaar' });
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrls, setImageUrls] = useState({});
  const [loadingImages, setLoadingImages] = useState({});
  const fileInputRef = useRef(null);

  const documentTypes = [
    'Aadhaar', 'PAN', 'Voter Card', 'Driving License',
    'Passport', 'Marksheet', 'Experience Certificate',
    'Income Certificate', 'Disability Certificate',
    'Birth Certificate', 'Signature', 'Domicile Certificate',
    'Resume', 'Other Documents'
  ];

  useEffect(() => {
    loadDocuments();
  }, [user]);

  useEffect(() => {
    return () => {
      Object.values(imageUrls).forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [imageUrls]);

  // Load images when documents change
  useEffect(() => {
    documents.forEach(doc => {
      if (isImageFile(doc.fileName, doc.mimeType) && !imageUrls[doc._id] && !loadingImages[doc._id]) {
        loadImageUrl(doc._id, documentApi.getFileUrl(doc._id));
      }
    });
  }, [documents]);

  const loadDocuments = async () => {
    if (!user) return;
    try {
      const res = await documentApi.getAll(user._id || user.id);
      console.log('Documents response:', res);
      if (res.success) {
        console.log('Documents loaded:', res.documents);
        setDocuments(res.documents);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
      setMessage('Failed to load documents');
    }
    setLoading(false);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage('Please select a file');
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setMessage('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    setMessage('');

    const uploadData = new FormData();
    uploadData.append('file', selectedFile);
    uploadData.append('userId', user._id || user.id);
    uploadData.append('documentType', formData.documentType);

    try {
      const res = await documentApi.upload(uploadData);
      if (res.success) {
        setMessage('Document uploaded successfully!');
        setSelectedFile(null);
        loadDocuments();
      } else {
        setMessage(res.message || 'Upload failed');
      }
    } catch (err) {
      setMessage('Upload failed');
    }
    setUploading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this document?')) return;
    await documentApi.delete(id);
    setImageUrls(prev => {
      const newUrls = { ...prev };
      delete newUrls[id];
      return newUrls;
    });
    setMessage('Document deleted!');
    loadDocuments();
  };

  const loadImageUrl = async (docId, fileUrl) => {
    if (imageUrls[docId]) return imageUrls[docId];
    if (loadingImages[docId]) return null;

    console.log('Loading image for doc:', docId, 'URL:', fileUrl);
    setLoadingImages(prev => ({ ...prev, [docId]: true }));

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(fileUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log('Image fetch response status:', response.status);
      if (!response.ok) throw new Error('Failed to fetch image');

      const blob = await response.blob();
      console.log('Image blob size:', blob.size, 'type:', blob.type);
      const blobUrl = URL.createObjectURL(blob);
      setImageUrls(prev => ({ ...prev, [docId]: blobUrl }));
      console.log('Image loaded successfully for doc:', docId);
      return blobUrl;
    } catch (error) {
      console.error('Error loading image:', error, 'Doc ID:', docId);
      return null;
    } finally {
      setLoadingImages(prev => ({ ...prev, [docId]: false }));
    }
  };

  const isImageFile = (fileName, mimeType) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const hasImageExtension = imageExtensions.some(ext => fileName?.toLowerCase().endsWith(ext));
    const hasImageMimeType = mimeType?.includes('image');
    const result = hasImageExtension || hasImageMimeType;
    console.log('isImageFile check:', { fileName, mimeType, hasImageExtension, hasImageMimeType, result });
    return result;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Verified': return '#48bb78';
      case 'Pending': return '#ed8936';
      case 'Rejected': return '#e53e3e';
      default: return '#a0aec0';
    }
  };

  if (loading) return <div className="documents-container"><div className="loading">Loading...</div></div>;

  return (
    <div className="documents-container">
      <div className="documents-card">
        <h2>My Documents</h2>

        {message && <div className="message">{message}</div>}

        <div className="upload-section">
          <h3>Upload Document</h3>
          <div className="upload-form">
            <div className="form-group">
              <label>Document Type *</label>
              <select value={formData.documentType} onChange={(e) => setFormData({ documentType: e.target.value })}>
                {documentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div
              className={`drop-zone ${dragActive ? 'active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              {selectedFile ? (
                <p className="file-selected">{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</p>
              ) : (
                <>
                  <p>Drag & drop file here</p>
                  <p className="or">or</p>
                  <p className="browse">Click to browse</p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileSelect}
                hidden
              />
            </div>
            <button className="btn-upload" onClick={handleUpload} disabled={uploading || !selectedFile}>
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>

        <div className="documents-list">
          <h3>Uploaded Documents ({documents.length})</h3>
          {documents.length === 0 ? (
            <div className="empty-state">No documents uploaded yet.</div>
          ) : (
            <div className="document-grid">
              {documents.map(doc => {
                const isImage = isImageFile(doc.fileName, doc.mimeType);
                const imageUrl = imageUrls[doc._id];
                const isLoading = loadingImages[doc._id];

                return (
                  <div key={doc._id} className="document-item">
                    {isImage ? (
                      <div className="doc-image-container">
                        {isLoading ? (
                          <div className="doc-image-loader">Loading...</div>
                        ) : imageUrl ? (
                          <img 
                            src={imageUrl} 
                            alt={doc.fileName} 
                            className="doc-preview-image"
                            onClick={() => window.open(documentApi.getFileUrl(doc._id), '_blank')}
                          />
                        ) : (
                          <div className="doc-image-placeholder">No Preview</div>
                        )}
                      </div>
                    ) : null}
                    <div className="doc-info">
                      <span className="doc-type">{doc.documentType}</span>
                      <span className="doc-name">{doc.fileName}</span>
                      <span className="doc-size">{(doc.fileSize / 1024).toFixed(1)} KB</span>
                      <span className="doc-status" style={{ color: getStatusColor(doc.verificationStatus) }}>
                        {doc.verificationStatus}
                      </span>
                    </div>
                    <div className="doc-actions">
                      <a href={documentApi.getFileUrl(doc._id)} target="_blank" rel="noopener noreferrer" className="btn-view">View</a>
                      <button className="btn-delete" onClick={() => handleDelete(doc._id)}>Delete</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentsPage;

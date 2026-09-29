import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileApi, educationApi, experienceApi, skillApi, documentApi, preferenceApi, certificationApi } from '../api/profileApi';
import { FaUser, FaPhone, FaIdCard, FaMapMarkerAlt, FaHome, FaCity, FaMapPin, FaFlag, FaMale, FaFemale, FaFilePdf, FaFileImage, FaFile } from 'react-icons/fa';
import { MdCategory, MdBloodtype, MdWork, MdAccessible, MdDescription, MdSchool, MdWorkHistory } from 'react-icons/md';
import { HiOutlineDocumentText } from 'react-icons/hi';
import { BsFileEarmarkText, BsAward } from 'react-icons/bs';
import { RiFolderUserLine } from 'react-icons/ri';
import './ProfilePage.css';

const TABS = ['Personal', 'Education', 'Experience', 'Skills', 'Certifications', 'Documents', 'Preferences'];

const ProfilePage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Personal');
  const [profile, setProfile] = useState(null);
  const [address, setAddress] = useState(null);
const [educations, setEducations] = useState([]);
const [experiences, setExperiences] = useState([]);
const [skills, setSkills] = useState([]);
const [certifications, setCertifications] = useState([]);
const [documents, setDocuments] = useState([]);
const [docTypes, setDocTypes] = useState([]);
const [docStats, setDocStats] = useState(null);
const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({});
  const [addressData, setAddressData] = useState({});
  const [eduForm, setEduForm] = useState(getEmptyEdu());
  const [expForm, setExpForm] = useState(getEmptyExp());
  const [skillForm, setSkillForm] = useState(getEmptySkill());
  const [prefForm, setPrefForm] = useState({});
const [editingEdu, setEditingEdu] = useState(null);
const [editingExp, setEditingExp] = useState(null);
const [editingSkill, setEditingSkill] = useState(null);
const [editingCert, setEditingCert] = useState(null);
const [certForm, setCertForm] = useState(getEmptyCert());

const [uploadingType, setUploadingType] = useState(null);
const [dragOver, setDragOver] = useState(null);
const fileInputRefs = useRef({});
const [imageUrls, setImageUrls] = useState({});
const [certImageUrls, setCertImageUrls] = useState({});
const [profilePictureUrl, setProfilePictureUrl] = useState(null);

function getEmptyEdu() { return { educationType: '', schoolName: '', boardUniversity: '', stream: '', degree: '', specialization: '', institution: '', startingYear: '', passingYear: '', percentageCgpa: '' }; }
function getEmptyExp() { return { organization: '', role: '', employmentStatus: '', startDate: '', endDate: '', currentlyWorking: false, description: '' }; }
function getEmptySkill() { return { skillType: '', name: '', proficiency: 'Beginner', details: '' }; }
function getEmptyCert() { return { name: '', issuingOrganization: '', credentialId: '', credentialUrl: '', category: 'Technical', description: '', uploadMode: 'image', imageFileId: '', imageFileName: '', imageMimeType: '' }; }

  useEffect(() => { loadAllData(); loadDocTypes(); }, [user]);

  useEffect(() => {
    return () => {
      Object.values(imageUrls).forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
      Object.values(certImageUrls).forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
      if (profilePictureUrl && profilePictureUrl.startsWith('blob:')) {
        URL.revokeObjectURL(profilePictureUrl);
      }
    };
  }, [imageUrls, certImageUrls, profilePictureUrl]);

  // Load profile picture when user changes
  useEffect(() => {
    const loadProfilePicture = async () => {
      if (user?.profilePicture) {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(documentApi.getFileUrl(user.profilePicture), {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (response.ok) {
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            setProfilePictureUrl(blobUrl);
          }
        } catch (error) {
          console.error('Error loading profile picture:', error);
        }
      } else {
        setProfilePictureUrl(null);
      }
    };

    loadProfilePicture();
  }, [user]);

  // Load certification images when certifications data changes
  useEffect(() => {
    certifications.forEach(cert => {
      if (cert.imageFileId && !certImageUrls[cert.imageFileId]) {
        loadCertImageUrl(cert.imageFileId);
      }
    });
  }, [certifications]);

  // Load document images when documents data changes
  useEffect(() => {
    documents.forEach(doc => {
      const isImage = doc?.mimeType?.includes('image') || doc?.fileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
      if (isImage && !imageUrls[doc._id]) {
        loadImageUrl(doc._id, documentApi.getFileUrl(doc._id));
      }
    });
  }, [documents]);

  const loadImageUrl = async (docId, fileUrl) => {
    if (imageUrls[docId]) return imageUrls[docId];

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(fileUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch image');

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      setImageUrls(prev => ({ ...prev, [docId]: blobUrl }));
      return blobUrl;
    } catch (error) {
      console.error('Error loading image:', error);
      return null;
    }
  };

  const loadCertImageUrl = async (imageFileId) => {
    if (!imageFileId) return null;
    if (certImageUrls[imageFileId]) return certImageUrls[imageFileId];

    try {
      const token = localStorage.getItem('token');
      const imageUrl = certificationApi.getImage(imageFileId);
      console.log('Loading certification image:', imageFileId, 'URL:', imageUrl);
      
      const response = await fetch(imageUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        console.error('Failed to fetch certification image:', response.status, response.statusText);
        throw new Error('Failed to fetch certification image');
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      setCertImageUrls(prev => ({ ...prev, [imageFileId]: blobUrl }));
      console.log('Successfully loaded certification image:', imageFileId);
      return blobUrl;
    } catch (error) {
      console.error('Error loading certification image:', error, 'File ID:', imageFileId);
      return null;
    }
  };

  const loadDocTypes = async () => {
    try {
      const res = await documentApi.getTypes();
      if (res.success) setDocTypes(res.types);
    } catch (err) { console.error('Failed to load doc types'); }
  };

  const loadAllData = async () => {
    if (!user) return;
    const uid = user._id || user.id;
    setLoading(true);
    try {
      const [p, e, x, s, c, d, pr, st] = await Promise.all([
        profileApi.get(uid),
        educationApi.getAll(uid),
        experienceApi.getAll(uid),
        skillApi.getAll(uid),
        certificationApi.getAll(uid),
        documentApi.getAll(uid),
        preferenceApi.get(uid),
        documentApi.getStats(uid)
      ]);
      console.log('loadAllData response:', { p, e, x, s, c, d, pr, st });
      if (p.success) { setProfile(p.profile); setAddress(p.address); setFormData(p.profile || {}); setAddressData(p.address || {}); }
      if (e.success) setEducations(e.education);
      if (x.success) setExperiences(x.experience);
      if (s.success) setSkills(s.skills);
      if (c.success) setCertifications(c.certifications);
      if (d.success) {
        console.log('Setting documents:', d.documents);
        setDocuments(d.documents);
      }
      if (pr.success) { setPreferences(pr.preference); setPrefForm(pr.preference || {}); }
      if (st.success) setDocStats(st.stats);
    } catch (err) {
      showMessage('error', 'Failed to load data');
    }
    setLoading(false);
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleProfileSave = async () => {
    const uid = user._id || user.id;
    console.log('Saving profile for user:', uid);
    console.log('FormData:', formData);
    console.log('AddressData:', addressData);
    try {
      const profilePayload = { ...formData, userId: uid };
      console.log('Upserting profile...');
      const profileResult = await profileApi.upsertProfile(profilePayload);
      console.log('Profile result:', profileResult);

      if (!profileResult.success) {
        showMessage('error', profileResult.message || 'Failed to save profile');
        return;
      }

      const addressPayload = { ...addressData, userId: uid };
      console.log('Upserting address...');
      const addressResult = await profileApi.upsertAddress(addressPayload);
      console.log('Address result:', addressResult);

      if (!addressResult.success) {
        showMessage('error', addressResult.message || 'Failed to save address');
        return;
      }

      showMessage('success', 'Profile saved successfully!');
      setEditMode(false);
      await loadAllData();
    } catch (err) {
      console.error('Save error:', err);
      showMessage('error', 'Failed to save. Please try again.');
    }
  };

  const handleEduSave = async () => {
    const uid = user._id || user.id;
    const data = { ...eduForm, userId: uid, startingYear: parseInt(eduForm.startingYear) || undefined, passingYear: parseInt(eduForm.passingYear) || undefined, percentageCgpa: parseFloat(eduForm.percentageCgpa) || undefined };
    console.log('Saving education:', data);
    try {
      let result;
      if (editingEdu) {
        result = await educationApi.update(editingEdu, data);
      } else {
        result = await educationApi.create(data);
      }
      console.log('Education result:', result);
      if (result.success) {
        showMessage('success', editingEdu ? 'Education updated!' : 'Education added!');
        setEduForm(getEmptyEdu());
        setEditingEdu(null);
        await loadAllData();
      } else {
        showMessage('error', result.message || 'Failed to save education');
      }
    } catch (err) {
      console.error('Education save error:', err);
      showMessage('error', 'Failed to save education');
    }
  };

  const handleExpSave = async () => {
    const uid = user._id || user.id;
    const data = { ...expForm, userId: uid };
    console.log('Saving experience:', data);
    try {
      let result;
      if (editingExp) {
        result = await experienceApi.update(editingExp, data);
      } else {
        result = await experienceApi.create(data);
      }
      console.log('Experience result:', result);
      if (result.success) {
        showMessage('success', editingExp ? 'Experience updated!' : 'Experience added!');
        setExpForm(getEmptyExp());
        setEditingExp(null);
        await loadAllData();
      } else {
        showMessage('error', result.message || 'Failed to save experience');
      }
    } catch (err) {
      console.error('Experience save error:', err);
      showMessage('error', 'Failed to save experience');
    }
  };

  const handleEduDocUpload = async (eduId, docTypeId, file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showMessage('error', 'File size exceeds 5MB limit');
      return;
    }
    const fd = new FormData();
    fd.append('file', file);
    fd.append('userId', user._id || user.id);
    fd.append('documentType', docTypeId);
    fd.append('educationId', eduId);
    console.log('Uploading education doc:', { eduId, docTypeId, fileName: file.name, userId: user._id || user.id });
    try {
      const res = await documentApi.upload(fd);
      console.log('Upload result:', res);
      if (res.success) {
        showMessage('success', `Document uploaded!`);
        console.log('Calling loadAllData...');
        await loadAllData();
        console.log('loadAllData completed. Documents:', documents);
      } else {
        showMessage('error', res.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      showMessage('error', 'Upload failed');
    }
  };

  const handleExpDocUpload = async (expId, docTypeId, file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showMessage('error', 'File size exceeds 5MB limit');
      return;
    }
    const fd = new FormData();
    fd.append('file', file);
    fd.append('userId', user._id || user.id);
    fd.append('documentType', docTypeId);
    fd.append('experienceId', expId);
    console.log('Uploading experience doc:', { expId, docTypeId, fileName: file.name });
    try {
      const res = await documentApi.upload(fd);
      console.log('Upload result:', res);
      if (res.success) {
        showMessage('success', `Document uploaded!`);
        await loadAllData();
      } else {
        showMessage('error', res.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      showMessage('error', 'Upload failed');
    }
  };

  const handleSkillSave = async () => {
    const data = { ...skillForm, userId: user._id || user.id };
    try {
      if (editingSkill) { await skillApi.update(editingSkill, data); showMessage('success', 'Skill updated!'); }
      else { await skillApi.create(data); showMessage('success', 'Skill added!'); }
      setSkillForm(getEmptySkill()); setEditingSkill(null); loadAllData();
    } catch (err) { showMessage('error', 'Failed'); }
  };

  const handleCertSave = async () => {
    const uid = user._id || user.id;
    const data = { ...certForm, userId: uid };
    console.log('Saving certification with imageFileId:', data.imageFileId, 'imageFileName:', data.imageFileName);
    try {
      let result;
      if (editingCert) {
        result = await certificationApi.update(editingCert, data);
      } else {
        result = await certificationApi.create(data);
      }
      console.log('Certification result:', result);
      if (result.success) {
        showMessage('success', editingCert ? 'Certification updated!' : 'Certification added!');
        setCertForm(getEmptyCert());
        setEditingCert(null);
        await loadAllData();
      } else {
        showMessage('error', result.message || 'Failed to save certification');
      }
    } catch (err) {
      console.error('Certification save error:', err);
      showMessage('error', 'Failed to save certification');
    }
  };

  const handleCertImageUpload = async (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showMessage('error', 'File size exceeds 5MB limit');
      return;
    }
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      showMessage('error', 'Invalid file type. Only JPEG, PNG, WebP, GIF allowed');
      return;
    }
    const fd = new FormData();
    fd.append('image', file);
    try {
      const res = await certificationApi.uploadImage(fd);
      if (res.success) {
        setCertForm({ ...certForm, imageFileId: res.imageFileId, imageFileName: res.imageFileName, imageMimeType: res.imageMimeType });
        showMessage('success', 'Image uploaded!');
      } else {
        showMessage('error', res.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Cert image upload error:', err);
      showMessage('error', 'Upload failed');
    }
  };

  const handleCertUrlValidate = async (url) => {
    if (!url) {
      showMessage('error', 'Please enter a URL first');
      return;
    }
    try {
      const res = await certificationApi.validateUrl(url);
      if (res.isValid) {
        showMessage('success', 'URL is valid!');
      } else {
        showMessage('error', 'Invalid URL format');
      }
    } catch (err) {
      console.error('URL validation error:', err);
      showMessage('error', 'Validation failed');
    }
  };

  const handleFileSelect = async (typeId, file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showMessage('error', 'File size exceeds 5MB limit');
      return;
    }
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      showMessage('error', 'Invalid file type. Only JPEG, PNG, PDF allowed');
      return;
    }

    setUploadingType(typeId);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('userId', user._id || user.id);
    fd.append('documentType', typeId);
    console.log('Uploading document:', { typeId, fileName: file.name, userId: user._id || user.id });

    try {
      const res = await documentApi.upload(fd);
      console.log('Upload result:', res);
      if (res.success) {
        showMessage('success', `${file.name} uploaded successfully!`);
        console.log('Calling loadAllData...');
        await loadAllData();
        console.log('loadAllData completed. Documents count:', documents.length);
      } else {
        showMessage('error', res.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      showMessage('error', 'Upload failed');
    }
    setUploadingType(null);
    if (fileInputRefs.current[typeId]) {
      fileInputRefs.current[typeId].value = '';
    }
  };

  const handleDocDelete = async (docId, fileName) => {
    if (!window.confirm(`Delete "${fileName}"?`)) return;
    try {
      await documentApi.delete(docId);
      showMessage('success', 'Document deleted');
      loadAllData();
    } catch (err) {
      showMessage('error', 'Failed to delete');
    }
  };

  const handleDragOver = (e, typeId) => {
    e.preventDefault();
    setDragOver(typeId);
  };

  const handleDragLeave = () => {
    setDragOver(null);
  };

  const handleDrop = async (e, typeId) => {
    e.preventDefault();
    setDragOver(null);
    const file = e.dataTransfer.files[0];
    if (file) await handleFileSelect(typeId, file);
  };

  const getDocsByType = (typeId) => {
    const typeInfo = docTypes.find(t => t.id === typeId);
    if (!typeInfo) {
      console.log('No typeInfo found for:', typeId);
      return [];
    }
    const filtered = documents.filter(doc => {
      const match = doc.documentType === typeInfo.label;
      if (match) {
        console.log('Document matched:', doc.documentType, '===', typeInfo.label);
      }
      return match;
    });
    console.log(`getDocsByType(${typeId}): found ${filtered.length} documents`);
    return filtered;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (mimeType) => {
    if (mimeType?.includes('pdf')) return <FaFilePdf />;
    if (mimeType?.includes('image')) return <FaFileImage />;
    return <FaFile />;
  };

  const handlePrefSave = async () => {
    const uid = user._id || user.id;
    const data = {
      userId: uid,
      hobbies: typeof prefForm.hobbies === 'string' ? prefForm.hobbies.split(',').map(s => s.trim()).filter(Boolean) : prefForm.hobbies || [],
      interests: typeof prefForm.interests === 'string' ? prefForm.interests.split(',').map(s => s.trim()).filter(Boolean) : prefForm.interests || [],
      preferredLanguages: typeof prefForm.preferredLanguages === 'string' ? prefForm.preferredLanguages.split(',').map(s => s.trim()).filter(Boolean) : prefForm.preferredLanguages || [],
      locationPreferences: typeof prefForm.locationPreferences === 'string' ? prefForm.locationPreferences.split(',').map(s => s.trim()).filter(Boolean) : prefForm.locationPreferences || [],
      opportunityTypePreferences: typeof prefForm.opportunityTypePreferences === 'string' ? prefForm.opportunityTypePreferences.split(',').map(s => s.trim()).filter(Boolean) : prefForm.opportunityTypePreferences || [],
      salaryRange: { min: parseInt(prefForm.salaryMin) || 0, max: parseInt(prefForm.salaryMax) || 0 }
    };
    try {
      if (preferences) await preferenceApi.update(uid, data);
      else await preferenceApi.create(data);
      showMessage('success', 'Preferences saved!');
      loadAllData();
    } catch (err) { showMessage('error', 'Failed'); }
  };

  const getVisibleDocTypes = () => {
    const visible = new Set();

    docTypes.forEach(type => visible.add(type.id));

    if (educations.length > 0) {
      visible.add('marksheet');
      visible.add('degree');
    }

    if (experiences.length > 0) {
      visible.add('experience_cert');
    }

    if (profile?.disability?.hasDisability) {
      visible.add('disability_cert');
    }

    return docTypes.filter(type => visible.has(type.id));
  };

  const visibleDocTypes = getVisibleDocTypes();

  const groupedDocTypes = {
    identity: visibleDocTypes.filter(t => t.category === 'identity'),
    financial: visibleDocTypes.filter(t => t.category === 'financial'),
    medical: visibleDocTypes.filter(t => t.category === 'medical'),
    other: visibleDocTypes.filter(t => t.category === 'other')
  };

  const categoryLabels = {
    identity: { title: 'Identity Documents', icon: <RiFolderUserLine /> },
    financial: { title: 'Financial Documents', icon: <FaFile /> },
    medical: { title: 'Medical Documents', icon: <MdDescription /> },
    other: { title: 'Other Documents', icon: <BsFileEarmarkText /> }
  };

  if (loading) return <div className="profile-page"><div className="loading-spinner">Loading...</div></div>;

  return (
    <div className="profile-page">
      {message.text && <div className={`toast toast-${message.type}`}>{message.text}</div>}

      <div className="profile-header">
        <div className="header-content">
          <div className="user-avatar">
            {profilePictureUrl ? (
              <img src={profilePictureUrl} alt="Profile" className="profile-picture" />
            ) : (
              <span>{(user?.fullName || 'U')[0]}</span>
            )}
          </div>
          <div className="user-info">
            <h1>{user?.fullName}</h1>
            <p className="user-id">ID: {user?._id || user?.id}</p>
            <p className="user-email">{user?.email}</p>
          </div>
        </div>
        {profile && (
          <div className="completeness-widget">
            <div className="completeness-ring">
              <svg viewBox="0 0 36 36">
                <path className="ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="ring-fill" strokeDasharray={`${profile.completenessScore || 0}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <span className="ring-text">{profile.completenessScore || 0}%</span>
            </div>
            <span className="ring-label">Profile Complete</span>
          </div>
        )}
      </div>

      <div className="tabs-container">
        {TABS.map(tab => (
          <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab}
            {tab === 'Documents' && docStats?.total > 0 && <span className="tab-badge">{docStats.total}</span>}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === 'Personal' && (
          <div className="personal-section">
            {!editMode ? (
              <>
                <div className="section-header">
                  <h2>Personal Information</h2>
                  <button className="btn-edit" onClick={() => setEditMode(true)}>Edit</button>
                </div>
                <div className="info-cards">
                  <div className="info-card"><span className="info-label"><FaUser /> Father's Name</span><span className="info-value">{profile?.fatherName || '-'}</span></div>
                  <div className="info-card"><span className="info-label"><FaUser /> Mother's Name</span><span className="info-value">{profile?.motherName || '-'}</span></div>
                  <div className="info-card"><span className="info-label"><FaPhone /> Father's Phone</span><span className="info-value">{profile?.fatherPhoneNumber || '-'}</span></div>
                  <div className="info-card"><span className="info-label"><FaPhone /> Mother's Phone</span><span className="info-value">{profile?.motherPhoneNumber || '-'}</span></div>
                  <div className="info-card"><span className="info-label"><FaPhone /> Phone Number</span><span className="info-value">{profile?.phoneNumber || '-'}</span></div>
                  <div className="info-card"><span className="info-label"><FaIdCard /> ABC ID</span><span className="info-value">{profile?.abcId || '-'}</span></div>
                  <div className="info-card"><span className="info-label">Date of Birth</span><span className="info-value">{profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : '-'}</span></div>
                  <div className="info-card"><span className="info-label">Age</span><span className="info-value">{profile?.age ? `${profile.age} years` : '-'}</span></div>
                  <div className="info-card"><span className="info-label"><FaMale /> Gender</span><span className="info-value">{profile?.gender || '-'}</span></div>
                  <div className="info-card"><span className="info-label"><MdBloodtype /> Blood Group</span><span className="info-value">{profile?.bloodGroup || '-'}</span></div>
                  <div className="info-card"><span className="info-label"><MdWork /> Profession</span><span className="info-value">{profile?.profession || '-'}</span></div>
                  <div className="info-card"><span className="info-label"><MdCategory /> Category</span><span className="info-value">{profile?.category || '-'}</span></div>
                  <div className="info-card"><span className="info-label">Annual Income</span><span className="info-value">{profile?.income ? `₹${profile.income.toLocaleString()}` : '-'}</span></div>
                  <div className="info-card"><span className="info-label"><MdAccessible /> Disability</span><span className="info-value">{profile?.disability?.hasDisability ? `${profile.disability.type} (${profile.disability.percentage}%)` : 'None'}</span></div>
                </div>
                {address && (
                  <div className="address-block">
                    <h3>Address</h3>
                    <p>{address.villageTown}, {address.district && `${address.district}, `}{address.city}, {address.state} - {address.pinCode}, {address.country}</p>
                  </div>
                )}
              </>
            ) : (
<form className="edit-form" onSubmit={(e) => { e.preventDefault(); handleProfileSave(); }}>
                <div className="section-header"><h2>Edit Personal Information</h2></div>
                <div className="form-grid">
                  <div className="form-field"><label>Father's Name *</label><input value={formData.fatherName || ''} onChange={e => setFormData({ ...formData, fatherName: e.target.value })} required /></div>
                  <div className="form-field"><label>Mother's Name *</label><input value={formData.motherName || ''} onChange={e => setFormData({ ...formData, motherName: e.target.value })} required /></div>
                  <div className="form-field"><label>Father's Phone Number</label><input type="tel" value={formData.fatherPhoneNumber || ''} onChange={e => setFormData({ ...formData, fatherPhoneNumber: e.target.value })} /></div>
                  <div className="form-field"><label>Mother's Phone Number</label><input type="tel" value={formData.motherPhoneNumber || ''} onChange={e => setFormData({ ...formData, motherPhoneNumber: e.target.value })} /></div>
                  <div className="form-field"><label>Phone Number</label><input type="tel" value={formData.phoneNumber || ''} onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })} /></div>
                  <div className="form-field"><label>ABC ID</label><input value={formData.abcId || ''} onChange={e => setFormData({ ...formData, abcId: e.target.value })} /></div>
                  <div className="form-field"><label>Date of Birth *</label><input type="date" value={formData.dateOfBirth?.split('T')[0] || ''} onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })} required /></div>
                  <div className="form-field"><label>Gender *</label><select value={formData.gender || ''} onChange={e => setFormData({ ...formData, gender: e.target.value })} required><option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option><option value="Prefer not to say">Prefer not to say</option></select></div>
                  <div className="form-field"><label>Blood Group</label><select value={formData.bloodGroup || ''} onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}><option value="">Select</option>{['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => <option key={b} value={b}>{b}</option>)}</select></div>
                  <div className="form-field"><label>Profession *</label><input value={formData.profession || ''} onChange={e => setFormData({ ...formData, profession: e.target.value })} required /></div>
                  <div className="form-field"><label>Category *</label><select value={formData.category || ''} onChange={e => setFormData({ ...formData, category: e.target.value })} required><option value="">Select</option>{['General','OBC','SC','ST','EWS','Other'].map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                  <div className="form-field"><label>Annual Income (₹) *</label><input type="number" value={formData.income || ''} onChange={e => setFormData({ ...formData, income: e.target.value })} required /></div>
                </div>

                <h3 className="sub-section-title">Disability Information</h3>
                <div className="form-grid">
                  <div className="form-field">
                    <label>Do you have a disability?</label>
                    <select value={formData.disability?.hasDisability ? 'yes' : 'no'} onChange={e => setFormData({ ...formData, disability: { ...formData.disability, hasDisability: e.target.value === 'yes' } })}>
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </div>
                  {formData.disability?.hasDisability && (
                    <>
                      <div className="form-field">
                        <label>Disability Type</label>
                        <select value={formData.disability?.type || ''} onChange={e => setFormData({ ...formData, disability: { ...formData.disability, type: e.target.value } })}>
                          <option value="">Select</option>
                          <option value="Visual">Visual Impairment</option>
                          <option value="Hearing">Hearing Impairment</option>
                          <option value="Locomotor">Locomotor Disability</option>
                          <option value="Mental">Mental Illness</option>
                          <option value="Intellectual">Intellectual Disability</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="form-field">
                        <label>Disability Percentage (%)</label>
                        <input type="number" min="0" max="100" value={formData.disability?.percentage || ''} onChange={e => setFormData({ ...formData, disability: { ...formData.disability, percentage: parseInt(e.target.value) } })} />
                      </div>
                    </>
                  )}
                </div>

                <h3 className="sub-section-title">Address</h3>
                <div className="form-grid">
                  <div className="form-field"><label>Village/Town</label><input value={addressData.villageTown || ''} onChange={e => setAddressData({ ...addressData, villageTown: e.target.value })} /></div>
                  <div className="form-field"><label>District</label><input value={addressData.district || ''} onChange={e => setAddressData({ ...addressData, district: e.target.value })} /></div>
                  <div className="form-field"><label>City *</label><input value={addressData.city || ''} onChange={e => setAddressData({ ...addressData, city: e.target.value })} required /></div>
                  <div className="form-field"><label>State *</label><input value={addressData.state || ''} onChange={e => setAddressData({ ...addressData, state: e.target.value })} required /></div>
                  <div className="form-field"><label>Pin Code *</label><input value={addressData.pinCode || ''} onChange={e => setAddressData({ ...addressData, pinCode: e.target.value })} pattern="\d{6}" required /></div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-save">Save Changes</button>
                  <button type="button" className="btn-cancel" onClick={() => setEditMode(false)}>Cancel</button>
                </div>
              </form>
            )}
          </div>
        )}

{activeTab === 'Education' && (
          <div className="education-section">
            <div className="section-header"><h2>Education</h2></div>
            <form className="compact-form" onSubmit={(e) => { e.preventDefault(); handleEduSave(); }}>
              <div className="form-row">
                <select value={eduForm.educationType} onChange={e => setEduForm({ ...eduForm, educationType: e.target.value, stream: '', degree: '', specialization: '' })} required>
                  <option value="">Select Type</option>
                  {['Primary','Secondary','Higher Secondary','Under-Graduate','Post Graduate','Phd'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {eduForm.educationType && (
                  <>
                    {(eduForm.educationType === 'Primary' || eduForm.educationType === 'Secondary' || eduForm.educationType === 'Higher Secondary') && (
                      <input placeholder="School Name" value={eduForm.schoolName} onChange={e => setEduForm({ ...eduForm, schoolName: e.target.value })} required />
                    )}
                    {(eduForm.educationType === 'Under-Graduate' || eduForm.educationType === 'Post Graduate' || eduForm.educationType === 'Phd') && (
                      <input placeholder="Institution" value={eduForm.institution} onChange={e => setEduForm({ ...eduForm, institution: e.target.value })} required />
                    )}
                    {eduForm.educationType === 'Higher Secondary' && (
                      <select value={eduForm.stream || ''} onChange={e => setEduForm({ ...eduForm, stream: e.target.value })}>
                        <option value="">Select Stream</option>
                        {['Science','Commerce','Arts'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    )}
                    {(eduForm.educationType === 'Under-Graduate' || eduForm.educationType === 'Post Graduate') && (
                      <input placeholder="Pursuing Degree" value={eduForm.degree} onChange={e => setEduForm({ ...eduForm, degree: e.target.value })} required />
                    )}
                    {eduForm.educationType === 'Phd' && (
                      <input placeholder="Research Area" value={eduForm.researchArea} onChange={e => setEduForm({ ...eduForm, researchArea: e.target.value })} required />
                    )}
                    <input placeholder="Board/University" value={eduForm.boardUniversity} onChange={e => setEduForm({ ...eduForm, boardUniversity: e.target.value })} required />
                    <input placeholder="Starting Year" type="number" value={eduForm.startingYear} onChange={e => setEduForm({ ...eduForm, startingYear: e.target.value })} required />
                    <input placeholder="Passing Year" type="number" value={eduForm.passingYear} onChange={e => setEduForm({ ...eduForm, passingYear: e.target.value })} required />
                    {(eduForm.educationType === 'Under-Graduate' || eduForm.educationType === 'Post Graduate' || eduForm.educationType === 'Phd') ? (
                      <input placeholder="CGPA" type="number" step="0.01" value={eduForm.percentageCgpa} onChange={e => setEduForm({ ...eduForm, percentageCgpa: e.target.value })} required />
                    ) : (
                      <input placeholder="Score" type="number" step="0.01" value={eduForm.percentageCgpa} onChange={e => setEduForm({ ...eduForm, percentageCgpa: e.target.value })} required />
                    )}
                    <button type="submit" className="btn-add">{editingEdu ? 'Update' : 'Add'}</button>
                  </>
                )}
              </div>
            </form>
            <div className="timeline">
              {educations.sort((a, b) => (b.passingYear || 0) - (a.passingYear || 0)).map((edu, index) => {
                const eduMarksheet = documents.find(d => d.documentType === 'Marksheets' && d.educationId === edu._id);
                const eduCertificate = documents.find(d => d.documentType === 'Degree/Diploma' && d.educationId === edu._id);
                return (
                  <div key={edu._id} className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <div className="edu-card">
                        <div className="edu-card-header">
                          <span className="edu-year">{edu.startingYear || 'N/A'} - {edu.passingYear || 'Present'}</span>
                          <span className="edu-type-badge">{edu.educationType}</span>
                        </div>
                        <div className="edu-card-body">
                          <h4>{edu.schoolName || edu.institution}</h4>
                          <p>
                            {edu.boardUniversity}
                            {edu.stream ? ` | ${edu.stream}` : ''}
                            {edu.degree ? ` | ${edu.degree}` : ''}
                            {edu.researchArea ? ` | ${edu.researchArea}` : ''}
                            {edu.specialization ? ` | ${edu.specialization}` : ''}
                          </p>
                          <p className="edu-score">
                            {edu.educationType === 'Under-Graduate' || edu.educationType === 'Post Graduate' || edu.educationType === 'Phd' ? 'CGPA' : 'Score'}: {edu.percentageCgpa}
                          </p>
                        </div>
                        <div className="edu-docs-section">
                          <h5>Documents</h5>
                          <div className="edu-docs-grid">
                            <div className={`edu-doc-card ${eduMarksheet ? 'uploaded' : ''}`}>
                              {eduMarksheet ? (
                                <div className="doc-image-preview">
                                  <img src={imageUrls[eduMarksheet._id] || documentApi.getFileUrl(eduMarksheet._id)} alt="Marksheet" className="doc-thumbnail" />
                                  <div className="doc-card-actions">
                                    <a href={documentApi.getFileUrl(eduMarksheet._id)} target="_blank" rel="noopener noreferrer" className="doc-view-btn">View</a>
                                    <button onClick={() => handleDocDelete(eduMarksheet._id, 'Marksheet')} className="doc-delete-btn">Delete</button>
                                  </div>
                                </div>
                              ) : (
                                <div className="doc-card-upload" onClick={() => fileInputRefs.current[`marksheet_${edu._id}`]?.click()}>
                                  <div className="doc-card-icon"><HiOutlineDocumentText /></div>
                                  <span className="doc-card-title">Marksheet</span>
                                  <span>Click to upload</span>
                                  <input ref={el => fileInputRefs.current[`marksheet_${edu._id}`] = el} type="file" style={{ display: 'none' }} accept="image/jpeg,image/png,application/pdf" onChange={(e) => handleEduDocUpload(edu._id, 'marksheet', e.target.files[0])} />
                                </div>
                              )}
                            </div>
                            <div className={`edu-doc-card ${eduCertificate ? 'uploaded' : ''}`}>
                              {eduCertificate ? (
                                <div className="doc-image-preview">
                                  <img src={imageUrls[eduCertificate._id] || documentApi.getFileUrl(eduCertificate._id)} alt="Certificate" className="doc-thumbnail" />
                                  <div className="doc-card-actions">
                                    <a href={documentApi.getFileUrl(eduCertificate._id)} target="_blank" rel="noopener noreferrer" className="doc-view-btn">View</a>
                                    <button onClick={() => handleDocDelete(eduCertificate._id, 'Certificate')} className="doc-delete-btn">Delete</button>
                                  </div>
                                </div>
                              ) : (
                                <div className="doc-card-upload" onClick={() => fileInputRefs.current[`certificate_${edu._id}`]?.click()}>
                                  <div className="doc-card-icon"><BsAward /></div>
                                  <span className="doc-card-title">Certificate</span>
                                  <span>Click to upload</span>
                                  <input ref={el => fileInputRefs.current[`certificate_${edu._id}`] = el} type="file" style={{ display: 'none' }} accept="image/jpeg,image/png,application/pdf" onChange={(e) => handleEduDocUpload(edu._id, 'degree', e.target.files[0])} />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="edu-card-actions">
                          <button onClick={() => { setEduForm(edu); setEditingEdu(edu._id); }}>Edit</button>
                          <button onClick={() => { educationApi.delete(edu._id); loadAllData(); }}>Delete</button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'Experience' && (
          <div className="experience-section">
            <div className="section-header"><h2>Experience</h2></div>
            <form className="compact-form" onSubmit={(e) => { e.preventDefault(); handleExpSave(); }}>
              <div className="form-row">
                <input placeholder="Organization *" value={expForm.organization} onChange={e => setExpForm({ ...expForm, organization: e.target.value })} required />
                <input placeholder="Role *" value={expForm.role} onChange={e => setExpForm({ ...expForm, role: e.target.value })} required />
                <select value={expForm.employmentStatus} onChange={e => setExpForm({ ...expForm, employmentStatus: e.target.value })}>
                  <option value="">Select Status</option>
                  {['Full-time','Part-time','Contract','Internship','Freelance'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <input type="date" value={expForm.startDate?.split('T')[0] || ''} onChange={e => setExpForm({ ...expForm, startDate: e.target.value })} required />
                <input type="date" value={expForm.endDate?.split('T')[0] || ''} onChange={e => setExpForm({ ...expForm, endDate: e.target.value })} disabled={expForm.currentlyWorking} />
                <label className="checkbox-label"><input type="checkbox" checked={expForm.currentlyWorking} onChange={e => setExpForm({ ...expForm, currentlyWorking: e.target.checked })} /> Current</label>
                <button type="submit" className="btn-add">{editingExp ? 'Update' : 'Add'}</button>
              </div>
            </form>
            <div className="timeline">
              {experiences.sort((a, b) => new Date(b.startDate) - new Date(a.startDate)).map((exp) => {
                const expCertificate = documents.find(d => d.documentType === 'Experience Certificates' && d.experienceId === exp._id);
                return (
                  <div key={exp._id} className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <div className="exp-card">
                        <div className="exp-card-header">
                          <span className="exp-year">{new Date(exp.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} - {exp.currentlyWorking ? 'Present' : new Date(exp.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</span>
                          <span className="exp-type-badge">{exp.employmentStatus}</span>
                        </div>
                        <div className="exp-card-body">
                          <h4>{exp.organization}</h4>
                          <p>{exp.role}</p>
                          <p className="exp-duration">{exp.durationMonths} months</p>
                        </div>
                        <div className="exp-docs-section">
                          <h5>Documents</h5>
                          <div className="exp-docs-grid">
                            <div className={`exp-doc-card ${expCertificate ? 'uploaded' : ''}`}>
                              {expCertificate ? (
                                <div className="doc-image-preview">
                                  <img src={imageUrls[expCertificate._id] || documentApi.getFileUrl(expCertificate._id)} alt="Experience Certificate" className="doc-thumbnail" />
                                  <div className="doc-card-actions">
                                    <a href={documentApi.getFileUrl(expCertificate._id)} target="_blank" rel="noopener noreferrer" className="doc-view-btn">View</a>
                                    <button onClick={() => handleDocDelete(expCertificate._id, 'Experience Certificate')} className="doc-delete-btn">Delete</button>
                                  </div>
                                </div>
                              ) : (
                                <div className="doc-card-upload" onClick={() => fileInputRefs.current[`exp_cert_${exp._id}`]?.click()}>
                                  <div className="doc-card-icon"><MdWorkHistory /></div>
                                  <span className="doc-card-title">Experience Certificate</span>
                                  <span>Click to upload</span>
                                  <input ref={el => fileInputRefs.current[`exp_cert_${exp._id}`] = el} type="file" style={{ display: 'none' }} accept="image/jpeg,image/png,application/pdf" onChange={(e) => handleExpDocUpload(exp._id, 'experience_cert', e.target.files[0])} />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="exp-card-actions">
                          <button onClick={() => { setExpForm(exp); setEditingExp(exp._id); }}>Edit</button>
                          <button onClick={() => { experienceApi.delete(exp._id); loadAllData(); }}>Delete</button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'Skills' && (
          <div className="list-section">
            <div className="section-header"><h2>Skills</h2></div>
            <form className="compact-form" onSubmit={(e) => { e.preventDefault(); handleSkillSave(); }}>
              <div className="form-row">
                <select value={skillForm.skillType} onChange={e => setSkillForm({ ...skillForm, skillType: e.target.value })} required>
                  <option value="">Type</option>
                  {['Technical','Soft','Language','Certification'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <input placeholder="Skill Name *" value={skillForm.name} onChange={e => setSkillForm({ ...skillForm, name: e.target.value })} required />
                <select value={skillForm.proficiency} onChange={e => setSkillForm({ ...skillForm, proficiency: e.target.value })}>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
                <button type="submit" className="btn-add">{editingSkill ? 'Update' : 'Add'}</button>
              </div>
            </form>
            <div className="skills-grid">
              {skills.map(skill => (
                <div key={skill._id} className="skill-pill">
                  <span className="skill-name">{skill.name}</span>
                  <span className="skill-prof">{skill.proficiency}</span>
                  <button className="pill-delete" onClick={() => { skillApi.delete(skill._id); loadAllData(); }}>x</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Certifications' && (
          <div className="certifications-section">
            <div className="section-header"><h2>Certifications</h2></div>
            <form className="compact-form cert-form" onSubmit={(e) => { e.preventDefault(); handleCertSave(); }}>
              <div className="form-grid-cert">
                <input placeholder="Certification Name" value={certForm.name} onChange={e => setCertForm({ ...certForm, name: e.target.value })} />
                <input placeholder="Issuing Organization" value={certForm.issuingOrganization} onChange={e => setCertForm({ ...certForm, issuingOrganization: e.target.value })} />
                <select value={certForm.category} onChange={e => setCertForm({ ...certForm, category: e.target.value })}>
                  <option value="Technical">Technical</option>
                  <option value="Professional">Professional</option>
                  <option value="Academic">Academic</option>
                  <option value="License">License</option>
                  <option value="Other">Other</option>
                </select>
                <input placeholder="Credential ID" value={certForm.credentialId} onChange={e => setCertForm({ ...certForm, credentialId: e.target.value })} />
                <input placeholder="Credential URL" value={certForm.credentialUrl} onChange={e => setCertForm({ ...certForm, credentialUrl: e.target.value })} />
                <textarea placeholder="Description" value={certForm.description || ''} onChange={e => setCertForm({ ...certForm, description: e.target.value })} rows="2" />
                <div className="cert-upload-row">
                  <div className="cert-upload-tabs">
                    <button type="button" className={certForm.uploadMode === 'image' ? 'cert-tab-active' : ''} onClick={() => setCertForm({ ...certForm, uploadMode: 'image' })}>Upload Image</button>
                    <button type="button" className={certForm.uploadMode === 'url' ? 'cert-tab-active' : ''} onClick={() => setCertForm({ ...certForm, uploadMode: 'url' })}>Add URL</button>
                  </div>
                  {certForm.uploadMode === 'image' ? (
                    <div className="cert-image-upload">
                      <input ref={el => fileInputRefs.current['cert_image'] = el} type="file" style={{ display: 'none' }} accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => handleCertImageUpload(e.target.files[0])} />
                      <div className="cert-upload-dropzone" onClick={() => fileInputRefs.current['cert_image']?.click()}>
                        <span className="dropzone-icon">🖼️</span>
                        <span className="dropzone-text">{certForm.imageFileName ? certForm.imageFileName : 'Click to upload certificate image'}</span>
                        <span className="dropzone-hint">JPEG, PNG, WebP, GIF (max 5MB)</span>
                      </div>
                      {certForm.imageFileId && (
                        <div className="cert-image-preview">
                          <img 
                            src={certImageUrls[certForm.imageFileId] || certificationApi.getImage(certForm.imageFileId)} 
                            alt="Certificate" 
                            className="cert-preview-img" 
                            onLoad={() => loadCertImageUrl(certForm.imageFileId)}
                            onError={(e) => { 
                              console.error('Failed to load cert image:', certForm.imageFileId);
                              e.target.style.display = 'none'; 
                            }} 
                          />
                          <button type="button" className="cert-remove-img" onClick={() => {
                            setCertForm({ ...certForm, imageFileId: '', imageFileName: '', imageMimeType: '' });
                            setCertImageUrls(prev => {
                              const newUrls = { ...prev };
                              delete newUrls[certForm.imageFileId];
                              return newUrls;
                            });
                          }}>Remove</button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="cert-url-input">
                      <input placeholder="https://example.com/certificate/verify" value={certForm.credentialUrl || ''} onChange={e => setCertForm({ ...certForm, credentialUrl: e.target.value })} />
                      <button type="button" className="btn-validate" onClick={() => handleCertUrlValidate(certForm.credentialUrl)}>Validate</button>
                    </div>
                  )}
                </div>
                <button type="submit" className="btn-add">{editingCert ? 'Update' : 'Add'}</button>
              </div>
            </form>
            <div className="cert-grid">
              {certifications.map(cert => (
                <div key={cert._id} className="cert-card">
                  <div className="cert-card-header">
                    {cert.imageFileId ? (
                      certImageUrls[cert.imageFileId] ? (
                        <img 
                          src={certImageUrls[cert.imageFileId]} 
                          alt={cert.name}
                          className="cert-card-img" 
                        />
                      ) : (
                        <div className="cert-card-img-loading">Loading...</div>
                      )
                    ) : (
                      <div className="cert-card-img-loading">No Image</div>
                    )}
                    <span className="cert-category-badge">{cert.category}</span>
                  </div>
                  <div className="cert-card-body">
                    <h4>{cert.name}</h4>
                    <p className="cert-org">{cert.issuingOrganization}</p>
                    {cert.credentialId && <p className="cert-cred-id">ID: {cert.credentialId}</p>}
                    {cert.description && <p className="cert-desc">{cert.description}</p>}
                    {cert.credentialUrl && (
                      <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="cert-link">View Credential</a>
                    )}
                  </div>
                  <div className="cert-card-actions">
                    <button onClick={() => { setCertForm(cert); setEditingCert(cert._id); }}>Edit</button>
                    <button onClick={() => { certificationApi.delete(cert._id); loadAllData(); }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Documents' && (
          <div className="documents-section">
            <div className="section-header">
              <h2>Documents</h2>
              {docStats && (
                <div className="doc-stats">
                  <span className="stat-item"><strong>{docStats.total}</strong> Total</span>
                  <span className="stat-divider">|</span>
                  <span className="stat-item"><strong>{docStats.byCategory.identity}</strong> Identity</span>
                </div>
              )}
            </div>

            <div className="doc-hint">
              <span>💡</span> Document upload options appear based on your profile data. Add education, experience, or disability info to see relevant document cards.
            </div>

            {Object.entries(groupedDocTypes).map(([category, types]) => {
              if (types.length === 0) return null;
              const catInfo = categoryLabels[category];
              return (
                <div key={category} className="doc-category">
                  <h3 className="category-title">
                    <span className="category-icon">{catInfo.icon}</span>
                    {catInfo.title}
                  </h3>
                  <div className="doc-grid">
                    {types.map(type => {
                      const typeDocs = getDocsByType(type.id);
                      const isUploading = uploadingType === type.id;
                      const isDragActive = dragOver === type.id;

                      return (
                        <div key={type.id} className={`doc-card ${isDragActive ? 'drag-active' : ''} ${typeDocs.length > 0 ? 'has-docs' : ''}`}>
                          <div className="doc-card-header">
                            <span className="doc-type-icon">{type.icon}</span>
                            <div className="doc-type-info">
                              <span className="doc-type-label">{type.label}</span>
                              {type.multiple && <span className="doc-multi-badge">Multi</span>}
                            </div>
                            <span className="doc-count">{typeDocs.length}</span>
                          </div>

                          {typeDocs.length > 0 && (() => {
                            const firstDoc = typeDocs[0];
                            const isImage = firstDoc?.mimeType?.includes('image') || firstDoc?.fileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                            
                            if (!isImage) return null;

                            return (
                              <div className="doc-image-full">
                                <img
                                  src={imageUrls[firstDoc._id] || documentApi.getFileUrl(firstDoc._id)}
                                  alt={firstDoc.fileName}
                                  className="doc-full-image"
                                  onClick={() => window.open(documentApi.getFileUrl(firstDoc._id), '_blank')}
                                  onError={(e) => {
                                    console.error('Image failed to load:', firstDoc._id, firstDoc.fileName);
                                    const fallbackUrl = documentApi.getFileUrl(firstDoc._id);
                                    if (e.target.src !== fallbackUrl) {
                                      e.target.src = fallbackUrl;
                                    }
                                  }}
                                />
                                <button
                                  className="doc-full-delete"
                                  onClick={() => handleDocDelete(firstDoc._id, firstDoc.fileName)}
                                  title="Delete"
                                >
                                  ×
                                </button>
                              </div>
                            );
                          })()}

                          {(() => {
                            const firstDoc = typeDocs[0];
                            const hasImage = firstDoc?.mimeType?.includes('image') || firstDoc?.fileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                            return !hasImage;
                          })() && (
                            <div
                              className="doc-dropzone"
                              onDragOver={(e) => handleDragOver(e, type.id)}
                              onDragLeave={handleDragLeave}
                              onDrop={(e) => handleDrop(e, type.id)}
                              onClick={() => fileInputRefs.current[type.id]?.click()}
                            >
                              {isUploading ? (
                                <div className="upload-progress">
                                  <div className="spinner"></div>
                                  <span>Uploading...</span>
                                </div>
                              ) : (
                                <>
                                  <div className="dropzone-icon">📤</div>
                                  <span className="dropzone-text">
                                    {typeDocs.length === 0 ? 'Drop file or click to upload' : 'Add more files'}
                                  </span>
                                  <span className="dropzone-hint">JPEG, PNG, PDF (max 5MB)</span>
                                </>
                              )}
                              <input
                                ref={el => fileInputRefs.current[type.id] = el}
                                type="file"
                                accept="image/jpeg,image/png,application/pdf"
                                onChange={(e) => handleFileSelect(type.id, e.target.files[0])}
                                style={{ display: 'none' }}
                              />
                            </div>
                          )}

                          {typeDocs.length > 0 && (!typeDocs[0]?.mimeType?.includes('image') && !typeDocs[0]?.fileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i)) && (
                            <div className="doc-list">
                              {typeDocs.slice(0, 1).map(doc => (
                                <div key={doc._id} className="doc-item">
                                  <span className="doc-file-icon">{getFileIcon(doc.mimeType)}</span>
                                  <div className="doc-file-info">
                                    <span className="doc-file-name" title={doc.fileName}>
                                      {doc.fileName.length > 25 ? doc.fileName.substring(0, 22) + '...' : doc.fileName}
                                    </span>
                                    <span className="doc-file-meta">
                                      {formatFileSize(doc.fileSize)} | {new Date(doc.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <div className="doc-file-actions">
                                    <a
                                      href={documentApi.getFileUrl(doc._id)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="doc-action-btn view"
                                      title="View"
                                    >
                                      👁️
                                    </a>
                                    <button
                                      className="doc-action-btn delete"
                                      onClick={() => handleDocDelete(doc._id, doc.fileName)}
                                      title="Delete"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'Preferences' && (
          <div className="list-section">
            <div className="section-header"><h2>Preferences</h2></div>
            <form className="preferences-form" onSubmit={(e) => { e.preventDefault(); handlePrefSave(); }}>
              <div className="pref-field">
                <label>Hobbies</label>
                <input value={typeof prefForm.hobbies === 'string' ? prefForm.hobbies : prefForm.hobbies?.join(', ') || ''} onChange={e => setPrefForm({ ...prefForm, hobbies: e.target.value })} placeholder="Reading, Cricket, Coding" />
              </div>
              <div className="pref-field">
                <label>Interests</label>
                <input value={typeof prefForm.interests === 'string' ? prefForm.interests : prefForm.interests?.join(', ') || ''} onChange={e => setPrefForm({ ...prefForm, interests: e.target.value })} placeholder="AI, Web Development" />
              </div>
              <div className="pref-field">
                <label>Languages</label>
                <input value={typeof prefForm.preferredLanguages === 'string' ? prefForm.preferredLanguages : prefForm.preferredLanguages?.join(', ') || ''} onChange={e => setPrefForm({ ...prefForm, preferredLanguages: e.target.value })} placeholder="English, Hindi" />
              </div>
              <div className="pref-field">
                <label>Preferred Locations</label>
                <input value={typeof prefForm.locationPreferences === 'string' ? prefForm.locationPreferences : prefForm.locationPreferences?.join(', ') || ''} onChange={e => setPrefForm({ ...prefForm, locationPreferences: e.target.value })} placeholder="Delhi, Bangalore" />
              </div>
              <div className="pref-field">
                <label>Opportunity Types</label>
                <input value={typeof prefForm.opportunityTypePreferences === 'string' ? prefForm.opportunityTypePreferences : prefForm.opportunityTypePreferences?.join(', ') || ''} onChange={e => setPrefForm({ ...prefForm, opportunityTypePreferences: e.target.value })} placeholder="Job, Internship" />
              </div>
              <div className="pref-row">
                <div className="pref-field">
                  <label>Salary Min (₹)</label>
                  <input type="number" value={prefForm.salaryMin || ''} onChange={e => setPrefForm({ ...prefForm, salaryMin: e.target.value })} />
                </div>
                <div className="pref-field">
                  <label>Salary Max (₹)</label>
                  <input type="number" value={prefForm.salaryMax || ''} onChange={e => setPrefForm({ ...prefForm, salaryMax: e.target.value })} />
                </div>
              </div>
              <button type="submit" className="btn-save">Save Preferences</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;

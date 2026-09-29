const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const Document = require('../models/document.model');

let gfsBucket;

mongoose.connection.once('open', () => {
  gfsBucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'documents' });
});

const DOCUMENT_TYPES = [
  { id: 'aadhaar', label: 'Aadhaar Card', icon: '🪪', category: 'identity', multiple: false },
  { id: 'pan', label: 'PAN Card', icon: '💳', category: 'identity', multiple: false },
  { id: 'voter', label: 'Voter ID', icon: '🗳️', category: 'identity', multiple: false },
  { id: 'driving', label: 'Driving License', icon: '🚗', category: 'identity', multiple: false },
  { id: 'passport', label: 'Passport', icon: '📘', category: 'identity', multiple: false },
  { id: 'photo', label: 'Passport Photo', icon: '📷', category: 'identity', multiple: false },
  { id: 'signature', label: 'Signature', icon: '✍️', category: 'identity', multiple: false },
  { id: 'birth_cert', label: 'Birth Certificate', icon: '📜', category: 'identity', multiple: false },
  { id: 'domicile', label: 'Domicile Certificate', icon: '🏠', category: 'identity', multiple: false },
  { id: 'marksheet', label: 'Marksheets', icon: '📝', category: 'education', multiple: true },
  { id: 'degree', label: 'Degree/Diploma', icon: '🎓', category: 'education', multiple: true },
  { id: 'experience_cert', label: 'Experience Certificates', icon: '📄', category: 'employment', multiple: true },
  { id: 'income_cert', label: 'Income Certificate', icon: '💰', category: 'financial', multiple: false },
  { id: 'caste_cert', label: 'Caste Certificate', icon: '📋', category: 'financial', multiple: false },
  { id: 'disability_cert', label: 'Disability Certificate', icon: '♿', category: 'medical', multiple: false },
  { id: 'resume', label: 'Resume', icon: '📄', category: 'other', multiple: true },
  { id: 'other', label: 'Other Documents', icon: '📁', category: 'other', multiple: true }
];

class DocumentController {
  getDocumentTypes(req, res) {
    try {
      res.json({ success: true, types: DOCUMENT_TYPES });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const { userId } = req.params;
      const documents = await Document.find({ userId }).sort({ createdAt: -1 });

      const grouped = {};
      DOCUMENT_TYPES.forEach(type => {
        grouped[type.id] = [];
      });

      documents.forEach(doc => {
        const typeKey = DOCUMENT_TYPES.find(t => t.label === doc.documentType)?.id || 'other';
        if (!grouped[typeKey]) grouped[typeKey] = [];
        grouped[typeKey].push(doc);
      });

      res.json({ success: true, documents, grouped });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getByType(req, res) {
    try {
      const { userId, typeId } = req.params;
      const typeInfo = DOCUMENT_TYPES.find(t => t.id === typeId);
      if (!typeInfo) {
        return res.status(400).json({ success: false, message: 'Invalid document type' });
      }

      const documents = await Document.find({ userId, documentType: typeInfo.label }).sort({ createdAt: -1 });
      res.json({ success: true, documents, typeInfo });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async upload(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      const { userId, documentType, educationId, experienceId } = req.body;

      if (!DOCUMENT_TYPES.find(t => t.id === documentType)) {
        return res.status(400).json({ success: false, message: 'Invalid document type' });
      }

      const typeInfo = DOCUMENT_TYPES.find(t => t.id === documentType);
      const { originalname, size, mimetype, buffer } = req.file;

      if (size > 5 * 1024 * 1024) {
        return res.status(400).json({ success: false, message: 'File size exceeds 5MB limit' });
      }

      // Resumes are commonly .docx, so allow Word documents alongside PDF/images.
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/jpg', 'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      if (!allowedTypes.includes(mimetype)) {
        return res.status(400).json({ success: false, message: 'Invalid file type. Only JPEG, PNG, PDF, DOC, DOCX allowed' });
      }

      const docId = 'DOC' + Date.now().toString().slice(-6) + Math.random().toString(36).substr(2, 4);

      const uploadStream = gfsBucket.openUploadStream(originalname, {
        contentType: mimetype,
        metadata: { userId, documentType: typeInfo.label, docId, typeId: documentType }
      });

      uploadStream.end(buffer);

      uploadStream.on('finish', async () => {
        try {
          const document = new Document({
            _id: docId,
            userId,
            documentType: typeInfo.label,
            educationId: educationId || null,
            experienceId: experienceId || null,
            fileName: originalname,
            fileSize: size,
            mimeType: mimetype,
            gridFsFileId: uploadStream.id.toString()
          });

          await document.save();

          // If this is a passport photo, update user's profile picture
          if (documentType === 'photo') {
            const User = require('../models/user.model');
            await User.findByIdAndUpdate(userId, { profilePicture: docId });
          }

          res.status(201).json({ success: true, document });
        } catch (saveError) {
          await gfsBucket.delete(uploadStream.id);
          res.status(500).json({ success: false, message: 'Failed to save document metadata' });
        }
      });

      uploadStream.on('error', (error) => {
        res.status(500).json({ success: false, message: 'Upload failed: ' + error.message });
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async download(req, res) {
    try {
      const { id } = req.params;
      const document = await Document.findById(id);
      if (!document) {
        return res.status(404).json({ success: false, message: 'Document not found' });
      }

      const downloadStream = gfsBucket.openDownloadStream(new mongoose.Types.ObjectId(document.gridFsFileId));
      res.set('Content-Type', document.mimeType);
      res.set('Content-Disposition', `inline; filename="${document.fileName}"`);
      
      downloadStream.on('error', (error) => {
        console.error('GridFS download error:', error.message);
        if (!res.headersSent) {
          res.status(404).json({ success: false, message: 'File not found in storage' });
        }
      });
      
      downloadStream.pipe(res);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const document = await Document.findById(id);
      if (!document) {
        return res.status(404).json({ success: false, message: 'Document not found' });
      }

      try {
        await gfsBucket.delete(new mongoose.Types.ObjectId(document.gridFsFileId));
      } catch (gridFsError) {
        console.warn('GridFS file may not exist:', gridFsError.message);
      }

      await Document.findByIdAndDelete(id);
      res.json({ success: true, message: 'Document deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getStats(req, res) {
    try {
      const { userId } = req.params;
      const documents = await Document.find({ userId });

      const stats = {
        total: documents.length,
        byCategory: {
          identity: 0,
          education: 0,
          employment: 0,
          financial: 0,
          medical: 0,
          other: 0
        }
      };

      documents.forEach(doc => {
        const typeInfo = DOCUMENT_TYPES.find(t => t.label === doc.documentType);
        if (typeInfo) {
          stats.byCategory[typeInfo.category] = (stats.byCategory[typeInfo.category] || 0) + 1;
        }
      });

      res.json({ success: true, stats });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getOne(req, res) {
    try {
      const { id } = req.params;
      const document = await Document.findById(id);
      if (!document) {
        return res.status(404).json({ success: false, message: 'Document not found' });
      }
      res.json({ success: true, document });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new DocumentController();
module.exports.DOCUMENT_TYPES = DOCUMENT_TYPES;

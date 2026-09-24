const path = require('path');
const fs = require('fs');
const { createId } = require('../services/id.service');
const { logAudit } = require('../services/audit.service');
const Form = require('../models/form.model');

const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads'));
const UPLOAD_PREFIX = '/uploads';

const ensureUploadDir = () => {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
};

class FormController {
  async list(req, res) {
    try {
      const filter = {};
      if (req.query.status) filter.status = req.query.status;
      if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
      if (req.query.exam) filter.exam = { $regex: req.query.q, $options: 'i' };

      const forms = await Form.find(filter).sort({ createdAt: -1 });
      res.json({ success: true, items: forms });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async get(req, res) {
    try {
      const form = await Form.findById(req.params.id);
      if (!form) {
        return res.status(404).json({ success: false, message: 'Form not found' });
      }
      res.json({ success: true, item: form });
    } catch (error) {
      if (error.name === 'CastError') {
        return res.status(400).json({ success: false, message: 'Invalid form identifier' });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req, res) {
    try {
      const body = { ...req.body };
      delete body._id;
      delete body.createdAt;
      delete body.updatedAt;
      const form = new Form({ _id: createId('FORM'), ...body });
      await form.save();
      await logAudit(req, 'FORM_CREATED', 'form', form._id, { title: form.title });
      res.status(201).json({ success: true, message: 'Form created successfully', item: form });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({ success: false, message: 'Form already exists' });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async update(req, res) {
    try {
      const body = { ...req.body };
      delete body._id;
      delete body.createdAt;
      delete body.updatedAt;
      const form = await Form.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
      if (!form) {
        return res.status(404).json({ success: false, message: 'Form not found' });
      }
      await logAudit(req, 'FORM_UPDATED', 'form', form._id, { title: form.title });
      res.json({ success: true, message: 'Form updated successfully', item: form });
    } catch (error) {
      if (error.name === 'CastError') {
        return res.status(400).json({ success: false, message: 'Invalid form identifier' });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async remove(req, res) {
    try {
      const form = await Form.findByIdAndDelete(req.params.id);
      if (!form) {
        return res.status(404).json({ success: false, message: 'Form not found' });
      }
      await logAudit(req, 'FORM_DELETED', 'form', form._id, {});
      res.json({ success: true, message: 'Form deleted successfully' });
    } catch (error) {
      if (error.name === 'CastError') {
        return res.status(400).json({ success: false, message: 'Invalid form identifier' });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async uploadImage(req, res) {
    try {
      ensureUploadDir();
      const upload = require('../middleware/upload.middleware');
      upload.single('file')(req, res, (err) => {
        if (err) {
          return res.status(400).json({ success: false, message: err.message });
        }
        if (!req.file) {
          return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        const fileUrl = `${UPLOAD_PREFIX}/${req.file.filename}`;
        res.json({ success: true, url: fileUrl, filename: req.file.filename });
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new FormController();
module.exports.UPLOAD_PREFIX = UPLOAD_PREFIX;

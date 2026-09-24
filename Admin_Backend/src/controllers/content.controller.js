const { createId } = require('../services/id.service');
const { logAudit } = require('../services/audit.service');

const parsePositiveInt = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const cleanBody = (body) => {
  const cleaned = { ...body };
  delete cleaned._id;
  delete cleaned.createdAt;
  delete cleaned.updatedAt;
  return cleaned;
};

const validateRequired = (body, fields) => {
  const missing = fields.filter((field) => body[field] === undefined || body[field] === null || body[field] === '');
  return missing;
};

const resourceConfig = {
  EligibilityRule: {
    name: 'eligibility-rule',
    searchFields: ['ruleName', 'field'],
    required: ['ruleName', 'field', 'operator']
  },
  Exam: {
    name: 'exam',
    searchFields: ['examName', 'examBody'],
    required: ['examName', 'examBody', 'examCategory', 'examType', 'examMode']
  },
  Opportunity: {
    name: 'opportunity',
    searchFields: ['title', 'organization'],
    required: ['title', 'organization', 'opportunityType', 'sourceUrl']
  }
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

class ContentController {
  async list(req, res, Model) {
    try {
      const config = resourceConfig[Model.modelName];
      const page = parsePositiveInt(req.query.page, 1);
      const limit = Math.min(parsePositiveInt(req.query.limit, 20), 100);
      const filter = {};
      if (req.query.q) {
        const search = req.query.q.trim();
        const escapedSearch = escapeRegex(search);
        const searchFields = config.searchFields.map((field) => ({ [field]: { $regex: escapedSearch, $options: 'i' } }));
        filter.$or = searchFields;
      }
      if (req.query.status) filter.status = req.query.status;
      if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
      if (req.query.verificationStatus) filter.verificationStatus = req.query.verificationStatus;

      const [items, total] = await Promise.all([
        Model.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
        Model.countDocuments(filter)
      ]);

      res.json({
        success: true,
        items,
        resource: config.name,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async get(req, res, Model) {
    try {
      const item = await Model.findById(req.params.id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Record not found' });
      }
      res.json({ success: true, item });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req, res, Model, prefix) {
    try {
      const body = cleanBody(req.body || {});
      const config = resourceConfig[Model.modelName];
      const missing = validateRequired(body, config.required);
      if (missing.length) {
        return res.status(400).json({ success: false, message: 'Required fields are missing', fields: missing });
      }
      const item = new Model({ _id: createId(prefix), ...body });
      await item.save();
      await logAudit(req, 'RECORD_CREATED', config.name, item._id, { title: body.ruleName || body.examName || body.title });
      res.status(201).json({ success: true, message: 'Record created successfully', item });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async update(req, res, Model) {
    try {
      const body = cleanBody(req.body || {});
      if (!Object.keys(body).length) {
        return res.status(400).json({ success: false, message: 'No fields to update' });
      }
      const item = await Model.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
      if (!item) {
        return res.status(404).json({ success: false, message: 'Record not found' });
      }
      const config = resourceConfig[Model.modelName];
      await logAudit(req, 'RECORD_UPDATED', config.name, item._id, { title: body.ruleName || body.examName || body.title });
      res.json({ success: true, message: 'Record updated successfully', item });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async remove(req, res, Model, resourceName) {
    try {
      const item = await Model.findByIdAndDelete(req.params.id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Record not found' });
      }
      await logAudit(req, 'RECORD_DELETED', resourceName, item._id, {});
      res.json({ success: true, message: 'Record deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new ContentController();

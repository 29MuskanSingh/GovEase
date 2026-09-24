const AuditLog = require('../models/auditLog.model');

const parsePositiveInt = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

class AuditController {
  async list(req, res) {
    try {
      const page = parsePositiveInt(req.query.page, 1);
      const limit = Math.min(parsePositiveInt(req.query.limit, 20), 100);
      const filter = {};
      if (req.query.action) filter.action = req.query.action;
      if (req.query.resourceType) filter.resourceType = req.query.resourceType;
      if (req.query.actorEmail) filter.actorEmail = { $regex: req.query.actorEmail, $options: 'i' };
      const [logs, total] = await Promise.all([
        AuditLog.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
        AuditLog.countDocuments(filter)
      ]);
      res.json({
        success: true,
        logs,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new AuditController();

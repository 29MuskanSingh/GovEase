const AuditLog = require('../models/auditLog.model');

const logAudit = async (req, action, resourceType, resourceId, details = {}) => {
  await AuditLog.create({
    actorUserId: req.user?._id || 'system',
    actorEmail: req.user?.email || 'system',
    action,
    resourceType,
    resourceId: resourceId || null,
    details,
    ipAddress: req.ip || req.socket?.remoteAddress || null,
    userAgent: req.get('user-agent') || null
  });
};

module.exports = { logAudit };

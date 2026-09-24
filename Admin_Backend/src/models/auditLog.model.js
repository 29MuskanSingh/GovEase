const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  actorUserId: { type: String, required: true, ref: 'AdminUser' },
  actorEmail: { type: String, required: true },
  action: { type: String, required: true },
  resourceType: { type: String, required: true },
  resourceId: String,
  details: { type: mongoose.Schema.Types.Mixed, default: {} },
  ipAddress: String,
  userAgent: String
}, { collection: 'audit_logs', timestamps: true });

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ actorUserId: 1, createdAt: -1 });
auditLogSchema.index({ resourceType: 1, resourceId: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);

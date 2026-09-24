const mongoose = require('mongoose');
const User = require('../models/user.model');
const AuditLog = require('../models/auditLog.model');
const { logAudit } = require('../services/audit.service');

const parsePositiveInt = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

class DashboardController {
  async metrics(req, res) {
    try {
      const db = mongoose.connection.db;
      const threshold = parsePositiveInt(process.env.PROFILE_COMPLETION_THRESHOLD, 80);
      const [
        totalUsers,
        activeUsers,
        suspendedUsers,
        totalProfiles,
        completedProfiles,
        totalDocuments,
        pendingDocuments,
        documentStatuses,
        activeOpportunities,
        activeExams,
        activeEligibilityRules,
        recentUsers,
        recentAuditLogs
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ status: 'Active' }),
        User.countDocuments({ status: 'Suspended' }),
        db.collection('profiles').countDocuments(),
        db.collection('profiles').countDocuments({ completenessScore: { $gte: threshold } }),
        db.collection('documents').countDocuments(),
        db.collection('documents').countDocuments({ verificationStatus: { $in: ['Pending', 'Unverified'] } }),
        db.collection('documents').aggregate([
          { $group: { _id: '$verificationStatus', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ]).toArray(),
        db.collection('opportunities').countDocuments({ status: 'Active' }),
        db.collection('exams').countDocuments({ status: { $in: ['Upcoming', 'Active'] }, isActive: true }),
        db.collection('eligibility_rules').countDocuments({ isActive: true }),
        User.find().select('-password -mfaSecret').sort({ createdAt: -1 }).limit(5),
        AuditLog.find().sort({ createdAt: -1 }).limit(5)
      ]);

      await logAudit(req, 'DASHBOARD_VIEWED', 'dashboard', null);
      res.json({
        success: true,
        metrics: {
          totalUsers,
          activeUsers,
          suspendedUsers,
          totalProfiles,
          completedProfiles,
          completionThreshold: threshold,
          totalDocuments,
          pendingDocuments,
          activeOpportunities,
          activeExams,
          activeEligibilityRules
        },
        documentStatuses,
        recentUsers: recentUsers.map((user) => {
          const data = user.toObject ? user.toObject() : user;
          const { password, mfaSecret, ...safeUser } = data;
          return safeUser;
        }),
        recentAuditLogs
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new DashboardController();

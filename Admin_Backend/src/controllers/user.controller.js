const User = require('../models/user.model');
const mongoose = require('mongoose');
const { logAudit } = require('../services/audit.service');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const serializeUser = (user) => {
  const data = user.toObject ? user.toObject() : user;
  const { password, mfaSecret, ...safeUser } = data;
  return safeUser;
};

const parsePositiveInt = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

class UserController {
  async list(req, res) {
    try {
      const page = parsePositiveInt(req.query.page, 1);
      const limit = Math.min(parsePositiveInt(req.query.limit, 20), 100);
      const skip = (page - 1) * limit;
      const filter = {};
      if (req.query.role) filter.role = req.query.role;
      if (req.query.status) filter.status = req.query.status;
      if (req.query.q) {
        const escaped = escapeRegex(req.query.q.trim());
        filter.$or = [
          { email: { $regex: escaped, $options: 'i' } },
          { fullName: { $regex: escaped, $options: 'i' } },
          { phone: { $regex: escaped, $options: 'i' } },
          { _id: { $regex: escaped, $options: 'i' } }
        ];
      }

      const [users, total] = await Promise.all([
        User.find(filter).select('-password -mfaSecret').sort({ createdAt: -1 }).skip(skip).limit(limit),
        User.countDocuments(filter)
      ]);

      res.json({
        success: true,
        users: users.map(serializeUser),
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async detail(req, res) {
    try {
      const user = await User.findById(req.params.id).select('-password -mfaSecret');
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const db = mongoose.connection.db;
      const userId = user._id;
      const [profile, address, identity, education, experience, skills, certifications, documents, preferences] = await Promise.all([
        db.collection('profiles').findOne({ userId }),
        db.collection('addresses').findOne({ userId }),
        db.collection('identities').findOne({ userId }),
        db.collection('education').findOne({ userId }),
        db.collection('experience').find({ userId }).sort({ createdAt: -1 }).toArray(),
        db.collection('skills').find({ userId }).sort({ createdAt: -1 }).toArray(),
        db.collection('certifications').find({ userId }).sort({ createdAt: -1 }).toArray(),
        db.collection('documents').find({ userId }).sort({ createdAt: -1 }).toArray(),
        db.collection('user_preferences').findOne({ userId })
      ]);

      res.json({
        success: true,
        user: serializeUser(user),
        profile,
        address,
        identity,
        education,
        experience,
        skills,
        certifications,
        documents,
        preferences
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async update(req, res) {
    try {
      const updates = {};
      if (req.body.status) updates.status = req.body.status;
      if (req.body.role) updates.role = req.body.role;
      if (req.body.fullName) updates.fullName = req.body.fullName.trim();
      if (req.body.email) updates.email = req.body.email.trim().toLowerCase();
      if (req.body.passwordChangeRequired !== undefined) updates.passwordChangeRequired = Boolean(req.body.passwordChangeRequired);
      if (req.body.lastPasswordResetAt) updates.lastPasswordResetAt = new Date(req.body.lastPasswordResetAt);
      if (!Object.keys(updates).length) {
        return res.status(400).json({ success: false, message: 'No supported fields to update' });
      }

      if (updates.status && !['Active', 'Suspended', 'Deleted'].includes(updates.status)) {
        return res.status(400).json({ success: false, message: 'Invalid status value' });
      }
      if (updates.role && !['USER', 'ADMIN'].includes(updates.role)) {
        return res.status(400).json({ success: false, message: 'Invalid role value' });
      }

      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      if (user.role === 'ADMIN' && (updates.role !== 'ADMIN' || updates.status !== 'Active')) {
        const activeAdmins = await User.countDocuments({ role: 'ADMIN', status: 'Active', _id: { $ne: user._id } });
        if (activeAdmins < 1) {
          return res.status(400).json({ success: false, message: 'At least one active administrator is required' });
        }
      }

      const updated = await User.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true, context: 'query' }).select('-password -mfaSecret');
      if (!updated) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      await logAudit(req, 'USER_UPDATED', 'user', updated._id, { updates: Object.keys(updates) });
      res.json({ success: true, message: 'User updated successfully', user: serializeUser(updated) });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async resetPassword(req, res) {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      const temporaryPassword = Math.random().toString(36).slice(-6) + Date.now().toString(36).slice(-6);
      user.password = temporaryPassword;
      user.passwordChangeRequired = true;
      user.lastPasswordResetAt = new Date();
      await user.save();
      await logAudit(req, 'PASSWORD_RESET', 'user', user._id, { temporaryPasswordIssued: true });
      res.json({
        success: true,
        message: 'Temporary password created',
        temporaryPassword,
        passwordChangeRequired: true
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new UserController();

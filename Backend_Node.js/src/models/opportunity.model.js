const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
  _id: { type: String, required: true },
  title: { type: String, required: true, trim: true },
  organization: { type: String, required: true, trim: true },
  opportunityType: {
    type: String,
    required: true,
    enum: ['Job', 'Internship', 'Scholarship', 'Scheme', 'Fellowship', 'Training', 'Exam', 'Other']
  },
  description: { type: String, trim: true },
  location: { type: String, trim: true },
  workModel: { type: String, enum: ['Remote', 'Hybrid', 'On-site'] },
  minAge: { type: Number, min: 0 },
  maxAge: { type: Number, min: 0 },
  educationalQualifications: { type: mongoose.Schema.Types.Mixed, default: {} },
  requiredSkills: { type: mongoose.Schema.Types.Mixed, default: {} },
  experienceRequired: { type: mongoose.Schema.Types.Mixed, default: {} },
  applicationStartDate: Date,
  applicationDeadline: Date,
  officialApplicationUrl: { type: String, trim: true },
  requiredDocuments: { type: mongoose.Schema.Types.Mixed, default: {} },
  eligibilityRules: { type: mongoose.Schema.Types.Mixed, default: {} },
  sourceUrl: { type: String, required: true, trim: true },
  verificationStatus: { type: String, enum: ['Unverified', 'Verified', 'Stale', 'Disputed'], default: 'Unverified' },
  status: { type: String, enum: ['Draft', 'Active', 'Closed', 'Expired', 'Cancelled'], default: 'Draft' }
}, { collection: 'opportunities', timestamps: true });

opportunitySchema.index({ opportunityType: 1, status: 1 });
opportunitySchema.index({ title: 'text', organization: 'text' });
opportunitySchema.index({ applicationDeadline: 1, status: 1 });

module.exports = mongoose.model('Opportunity', opportunitySchema);

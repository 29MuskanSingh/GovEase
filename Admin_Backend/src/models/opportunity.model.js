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
  categoryRequirements: { type: mongoose.Schema.Types.Mixed, default: {} },
  incomeRequirements: { type: mongoose.Schema.Types.Mixed, default: {} },
  disabilityRequirements: { type: mongoose.Schema.Types.Mixed, default: {} },
  domicileRequirements: { type: mongoose.Schema.Types.Mixed, default: {} },
  applicationStartDate: Date,
  applicationDeadline: Date,
  examDate: Date,
  interviewDate: Date,
  documentVerificationDate: Date,
  resultDate: Date,
  officialApplicationUrl: { type: String, trim: true },
  requiredDocuments: { type: mongoose.Schema.Types.Mixed, default: {} },
  eligibilityRules: { type: mongoose.Schema.Types.Mixed, default: {} },
  source: { type: String, required: true, enum: ['OFFICIAL_API', 'GOVERNMENT_WEBSITE', 'ADMIN_INPUT', 'PARTNER_API'], default: 'ADMIN_INPUT' },
  sourceUrl: { type: String, required: true, trim: true },
  lastVerifiedAt: Date,
  verificationStatus: { type: String, enum: ['Unverified', 'Verified', 'Stale', 'Disputed'], default: 'Unverified' },
  status: { type: String, enum: ['Draft', 'Active', 'Closed', 'Expired', 'Cancelled'], default: 'Draft' }
}, { collection: 'opportunities', timestamps: true });

opportunitySchema.index({ opportunityType: 1, status: 1 });
opportunitySchema.index({ title: 'text', organization: 'text' });
opportunitySchema.index({ applicationDeadline: 1, status: 1 });

module.exports = mongoose.model('Opportunity', opportunitySchema);

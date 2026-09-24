const mongoose = require('mongoose');

const eligibilityRuleSchema = new mongoose.Schema({
  field: { type: String, required: true, trim: true },
  operator: { type: String, required: true, enum: ['=', '!=', '>', '<', '>=', '<=', 'in'] },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  dataType: { type: String, required: true, enum: ['number', 'string', 'date', 'boolean'], default: 'string' },
  unit: { type: String, trim: true }
}, { _id: false });

const examSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  examName: { type: String, required: true, trim: true },
  examBody: { type: String, required: true, trim: true },
  examCategory: {
    type: String,
    required: true,
    enum: ['Civil Services', 'SSC', 'Banking', 'Railway', 'Defence', 'Police', 'Teaching', 'State PSC', 'PSU', 'Other']
  },
  examType: {
    type: String,
    required: true,
    enum: ['Preliminary', 'Mains', 'Interview', 'Physical Test', 'Skill Test', 'Document Verification', 'Other']
  },
  examMode: { type: String, required: true, enum: ['Online', 'Offline', 'Hybrid'] },
  totalVacancies: { type: Number, min: 0 },
  applicationFee: { type: Number, min: 0 },
  subjects: { type: mongoose.Schema.Types.Mixed, default: {} },
  totalMarks: { type: Number, min: 0 },
  durationMinutes: { type: Number, min: 0 },
  negativeMarking: { type: Boolean, default: false },
  negativeMarkingValue: { type: Number, min: 0 },
  cutoffMarks: { type: Number, min: 0 },
  numberOfAttemptsAllowed: { type: Number, min: 0 },
  ageRelaxation: { type: mongoose.Schema.Types.Mixed, default: {} },
  educationalQualifications: { type: mongoose.Schema.Types.Mixed, default: {} },
  physicalRequirements: { type: mongoose.Schema.Types.Mixed, default: {} },
  applicationStartDate: Date,
  applicationDeadline: Date,
  examDate: Date,
  resultDate: Date,
  scoreValidityYears: { type: Number, min: 0 },
  officialWebsite: { type: String, trim: true },
  eligibilityRules: { type: [eligibilityRuleSchema], default: [] },
  notificationSent: { type: Boolean, default: false },
  notificationSentAt: Date,
  status: { type: String, required: true, enum: ['Upcoming', 'Active', 'Closed', 'Expired', 'Cancelled'], default: 'Upcoming' },
  isActive: { type: Boolean, default: true }
}, { collection: 'exams', timestamps: true });

examSchema.index({ examBody: 1, examCategory: 1 });
examSchema.index({ examName: 'text' });
examSchema.index({ applicationDeadline: 1, status: 1 });

module.exports = mongoose.model('Exam', examSchema);

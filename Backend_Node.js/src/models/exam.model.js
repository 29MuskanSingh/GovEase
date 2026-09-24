const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  examName: { type: String, required: true, trim: true },
  examBody: { type: String, required: true, trim: true },
  examCategory: { type: String, trim: true },
  examType: { type: String, trim: true },
  examMode: { type: String, trim: true },
  totalVacancies: { type: Number, min: 0 },
  applicationFee: { type: Number, min: 0 },
  totalMarks: { type: Number, min: 0 },
  durationMinutes: { type: Number, min: 0 },
  negativeMarking: { type: Boolean, default: false },
  applicationStartDate: Date,
  applicationDeadline: Date,
  examDate: Date,
  resultDate: Date,
  officialWebsite: { type: String, trim: true },
  eligibilityRules: { type: mongoose.Schema.Types.Mixed, default: {} },
  status: { type: String, enum: ['Upcoming', 'Active', 'Closed', 'Expired', 'Cancelled'], default: 'Upcoming' },
  isActive: { type: Boolean, default: true }
}, { collection: 'exams', timestamps: true });

examSchema.index({ isActive: 1, status: 1 });
examSchema.index({ examName: 'text' });

module.exports = mongoose.model('Exam', examSchema);

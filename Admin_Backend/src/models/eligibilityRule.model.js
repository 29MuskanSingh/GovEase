const mongoose = require('mongoose');

const eligibilityRuleSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  ruleName: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  field: { type: String, required: true, trim: true },
  operator: { type: String, required: true, trim: true },
  params: { type: mongoose.Schema.Types.Mixed, default: {} },
  failureMessage: { type: String, trim: true },
  required: { type: Boolean, default: true },
  ruleVersion: { type: Number, default: 1, min: 1 },
  isActive: { type: Boolean, default: true }
}, { collection: 'eligibility_rules', timestamps: true });

eligibilityRuleSchema.index({ field: 1, isActive: 1 });
eligibilityRuleSchema.index({ ruleName: 'text' });

module.exports = mongoose.model('EligibilityRule', eligibilityRuleSchema);

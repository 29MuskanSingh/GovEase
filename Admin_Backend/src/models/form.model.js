const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema({
  fieldId: { type: String, required: true },
  label: { type: String, required: true, trim: true },
  type: {
    type: String,
    required: true,
    enum: ['text', 'email', 'number', 'textarea', 'select', 'radio', 'checkbox', 'date', 'image', 'signature', 'file']
  },
  key: { type: String, required: true, trim: true },
  required: { type: Boolean, default: false },
  placeholder: { type: String, trim: true },
  options: [{ label: String, value: String }],
  defaultValue: { type: mongoose.Schema.Types.Mixed },
  helpText: { type: String, trim: true },
  width: { type: String, enum: ['full', 'half', 'third'], default: 'full' },
  maxFileSize: { type: Number, min: 0 },
  allowedImageTypes: [{ type: String, lowercase: true, trim: true }],
  isMultiple: { type: Boolean, default: false },
  nestedFields: { type: [mongoose.Schema.Types.Mixed], default: [] },
  sortOrder: { type: Number, default: 0 }
}, { _id: false });

const formSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  exam: { type: String, trim: true },
  version: { type: Number, default: 1, min: 1 },
  status: { type: String, enum: ['draft', 'active', 'archived'], default: 'draft' },
  fields: { type: [fieldSchema], default: [] },
  settings: {
    allowSaveDraft: { type: Boolean, default: true },
    allowMultipleSubmissions: { type: Boolean, default: false },
    maxSubmissions: { type: Number, min: 0 }
  },
  createdBy: { type: String, trim: true },
  isActive: { type: Boolean, default: true }
}, { collection: 'forms', timestamps: true });

formSchema.index({ title: 'text', exam: 1 });
formSchema.index({ isActive: 1 });

module.exports = mongoose.model('Form', formSchema);

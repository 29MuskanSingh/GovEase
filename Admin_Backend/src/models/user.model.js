const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email']
  },
  phone: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters']
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['Active', 'Suspended', 'Deleted'],
    default: 'Active'
  },
  emailVerified: { type: Boolean, default: false },
  phoneVerified: { type: Boolean, default: false },
  mfaEnabled: { type: Boolean, default: false },
  mfaSecret: String,
  role: {
    type: String,
    enum: ['USER', 'ADMIN'],
    default: 'USER'
  },
  passwordChangeRequired: { type: Boolean, default: false },
  lastPasswordResetAt: Date,
  lastLoginAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'users', timestamps: true });

module.exports = mongoose.model('AdminUser', userSchema);

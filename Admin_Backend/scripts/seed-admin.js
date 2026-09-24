const path = require('path');
if (!process.env.MONGO_URI) {
  require('dotenv').config({ path: path.resolve(__dirname, '../../Backend_Node.js/.env') });
}
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/user.model');
const { connectDatabase } = require('../src/config/database');

const createAdmin = async () => {
  const email = (process.env.ADMIN_EMAIL || 'admin@govease.ai').toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || 'GovEase Administrator';

  if (!password) {
    throw new Error('ADMIN_PASSWORD is required');
  }

  await connectDatabase();
  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`Admin already exists: ${email}`);
    return;
  }

  const count = await User.countDocuments({ _id: { $regex: '^ADMIN' } });
  const admin = new User({
    _id: `ADMIN${String(count + 1).padStart(3, '0')}`,
    email,
    password,
    fullName: name,
    role: 'ADMIN',
    status: 'Active',
    emailVerified: true,
    phoneVerified: false,
    mfaEnabled: false,
    passwordChangeRequired: true
  });
  await admin.save({ validateBeforeSave: false });
  console.log(`Admin created: ${email}`);
};

createAdmin()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });

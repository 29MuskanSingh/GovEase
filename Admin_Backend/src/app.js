const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const path = require('path');

if (!process.env.MONGO_URI) {
  require('dotenv').config({ path: path.resolve(__dirname, '../../Backend_Node.js/.env') });
}
require('dotenv').config();
const { connectDatabase } = require('./config/database');
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const authMiddleware = require('./middleware/auth.middleware');

const app = express();

app.set('trust proxy', 1);

app.use(cors({
  origin: process.env.ADMIN_FRONTEND_URL || 'http://localhost:5174',
  credentials: true
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false
}));

app.get('/', (req, res) => {
  res.json({ success: true, service: 'govease-ai-admin-backend', docs: '/health', api: '/api/admin' });
});

app.get('/health', (req, res) => {
  res.json({ success: true, service: 'govease-ai-admin-backend' });
});

app.use('/uploads', express.static(path.resolve(process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads'))));

app.use('/api/admin/auth', authRoutes);
app.use('/api/admin', authMiddleware, adminRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((error, req, res, next) => {
  console.error(error);
  if (error.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: error.message, errors: error.errors });
  }
  if (error.code === 11000) {
    return res.status(409).json({ success: false, message: 'A record with the same unique value already exists' });
  }
  if (error.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid record identifier' });
  }
  res.status(500).json({ success: false, message: error.message || 'Internal server error' });
});

const start = async () => {
  await connectDatabase();
  const port = process.env.ADMIN_PORT || 3001;
  app.listen(port, () => {
    console.log(`Admin backend listening on port ${port}`);
  });
};

start().catch(async (error) => {
  console.error('Admin backend startup failed:', error);
  await mongoose.disconnect();
  process.exit(1);
});

module.exports = app;

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/profile.routes');
const educationRoutes = require('./routes/education.routes');
const experienceRoutes = require('./routes/experience.routes');
const skillRoutes = require('./routes/skill.routes');
const identityRoutes = require('./routes/identity.routes');
const documentRoutes = require('./routes/document.routes');
const preferenceRoutes = require('./routes/preference.routes');
const certificationRoutes = require('./routes/certification.routes');
const examRoutes = require('./routes/exam.routes');
const opportunityRoutes = require('./routes/opportunity.routes');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/*const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests from this IP' }
})
app.use(limiter);*/

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'GovEase AI API - Profile Management Module',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      auth: '/api/auth',
      profile: '/api/profile',
      education: '/api/education',
      experience: '/api/experience',
      skill: '/api/skill',
      identity: '/api/identity',
      document: '/api/document',
      preference: '/api/preference',
      certification: '/api/certification',
      exam: '/api/exams',
      opportunity: '/api/opportunities'
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/education', educationRoutes);
app.use('/api/experience', experienceRoutes);
app.use('/api/skill', skillRoutes);
app.use('/api/identity', identityRoutes);
app.use('/api/document', documentRoutes);
app.use('/api/preference', preferenceRoutes);
app.use('/api/certification', certificationRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/opportunities', opportunityRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Something went wrong'
  });
});

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, { dbName: process.env.MONGO_DB_NAME })
  .then(() => {
    console.log('Connected to MongoDB Atlas - Database: ' + process.env.MONGO_DB_NAME);
    app.listen(PORT, () => {
      console.log('[server] GovEase AI Backend listening on port ' + PORT);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = app;

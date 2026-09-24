const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { randomUUID } = require('crypto');

const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads'));

const ensureUploadDir = () => {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
};

ensureUploadDir();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.bin';
    const name = `${Date.now()}-${randomUUID().replace(/-/g, '')}${ext}`;
    cb(null, name);
  }
});

const imageMime = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml'];

const fileFilter = (req, file, cb) => {
  if (req.path.includes('image') || req.originalUrl.includes('image')) {
    return imageMime.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error('Only image files are allowed'), false);
  }
  cb(null, true);
};

const limits = {
  fileSize: typeof process.env.MAX_FILE_SIZE === 'string' ? parseInt(process.env.MAX_FILE_SIZE, 10) : 5 * 1024 * 1024
};

module.exports = multer({ storage, fileFilter, limits });

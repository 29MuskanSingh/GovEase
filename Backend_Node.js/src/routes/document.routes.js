const express = require('express');
const router = express.Router();
const documentController = require('../controllers/document.controller');
const authMiddleware = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.use(authMiddleware);

// Specific routes must come before parameterized routes
router.get('/types', documentController.getDocumentTypes);
router.get('/stats/:userId', documentController.getStats);
router.get('/file/:id', documentController.download);
router.post('/', upload.single('file'), documentController.upload);

// Parameterized routes
router.get('/:userId/type/:typeId', documentController.getByType);
router.get('/:userId/:id', documentController.getOne);
router.get('/:userId', documentController.getAll);
router.delete('/:id', documentController.delete);

module.exports = router;

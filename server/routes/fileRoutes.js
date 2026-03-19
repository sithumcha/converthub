const express = require('express');
const { convertFile, getHistory, batchDownload, getConversionStatus, downloadFile } = require('../controllers/fileController');
const { protect } = require('../middleware/authMiddleware');
const { checkUsageLimit } = require('../middleware/usageMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/convert', protect, checkUsageLimit, upload.single('file'), convertFile);
router.get('/history', protect, getHistory);
router.get('/status/:id', protect, getConversionStatus);
router.post('/batch-download', protect, batchDownload);
router.get('/download/:id', protect, downloadFile);

module.exports = router;

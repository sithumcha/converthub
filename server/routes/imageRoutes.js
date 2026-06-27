const express = require('express');
const router = express.Router();
const { processImage, removeBackground, batchProcess } = require('../controllers/imageController');
const { protect } = require('../middleware/authMiddleware');
const { checkUsageLimit } = require('../middleware/usageMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/process', protect, checkUsageLimit, upload.single('file'), processImage);
router.post('/remove-bg', protect, checkUsageLimit, upload.single('file'), removeBackground);
router.post('/batch', protect, checkUsageLimit, upload.array('files', 50), batchProcess);

module.exports = router;

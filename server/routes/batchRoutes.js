const express = require('express');
const router = express.Router();
const { processBatch } = require('../controllers/batchController');
const { protect } = require('../middleware/authMiddleware');
const { checkUsageLimit } = require('../middleware/usageMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/process', protect, checkUsageLimit, upload.array('files', 20), processBatch);

module.exports = router;

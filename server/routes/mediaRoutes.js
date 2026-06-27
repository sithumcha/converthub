const express = require('express');
const router = express.Router();
const { extractAudio, compressVideo } = require('../controllers/mediaController');
const { protect } = require('../middleware/authMiddleware');
const { checkUsageLimit } = require('../middleware/usageMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/extract-audio', protect, checkUsageLimit, upload.single('file'), extractAudio);
router.post('/compress-video', protect, checkUsageLimit, upload.single('file'), compressVideo);

module.exports = router;

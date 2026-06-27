const express = require('express');
const router = express.Router();
const extraController = require('../controllers/extraController');
const { protect } = require('../middleware/authMiddleware');

router.post('/web-capture', protect, extraController.captureWebsite);
router.post('/tts', protect, extraController.generateSpeech);

module.exports = router;

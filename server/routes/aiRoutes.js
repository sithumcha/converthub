const express = require('express');
const router = express.Router();
const multer = require('multer');
const aiController = require('../controllers/aiController');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    cb(null, `ai-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

router.post('/summarize', upload.single('file'), aiController.summarize);
router.post('/ocr', upload.single('file'), aiController.extractText);
router.post('/chat', aiController.chat);

module.exports = router;

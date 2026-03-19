const express = require('express');
const router = express.Router();
const { mergePDFs, splitPDF } = require('../controllers/pdfController');
const { protect } = require('../middleware/authMiddleware');
const { checkUsageLimit } = require('../middleware/usageMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Use upload.array for merge (multiple files)
router.post('/merge', protect, checkUsageLimit, upload.array('files', 10), mergePDFs);

// Use upload.single for split (one file)
router.post('/split', protect, checkUsageLimit, upload.single('file'), splitPDF);

const { compressPDF, convertPDFToDocx, protectPDF } = require('../controllers/pdfController');
router.post('/compress', protect, checkUsageLimit, upload.single('file'), compressPDF);
router.post('/to-docx', protect, checkUsageLimit, upload.single('file'), convertPDFToDocx);
router.post('/protect', protect, checkUsageLimit, upload.single('file'), protectPDF);

module.exports = router;

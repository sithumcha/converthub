const Conversion = require('../models/Conversion');
const User = require('../models/User');
const { incrementUsage } = require('../middleware/usageMiddleware');
const conversionQueue = require('../config/queue');
const path = require('path');
const fs = require('fs');

exports.convertFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { targetFormat } = req.body;
    if (!targetFormat) {
      return res.status(400).json({ success: false, message: 'Target format is required' });
    }

    const originalFormat = path.extname(req.file.originalname).toLowerCase().replace('.', '');

    const conversion = await Conversion.create({
      userId: req.user.id,
      type: 'file-convert',
      originalFiles: [{
        filename: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype
      }],
      status: 'pending'
    });

    const job = await conversionQueue.add({
      type: 'file-convert',
      filePath: req.file.path,
      originalName: req.file.originalname,
      targetFormat,
      userId: req.user.id,
      conversionId: conversion._id
    });

    res.status(202).json({
      success: true,
      message: 'Conversion started in background',
      jobId: job.id,
      conversionId: conversion._id,
      data: conversion
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const history = await Conversion.find({ userId: req.user.id }).sort('-createdAt');
    res.status(200).json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.batchDownload = async (req, res) => {
  try {
    const { conversionIds } = req.body;
    const conversions = await Conversion.find({
      _id: { $in: conversionIds },
      userId: req.user.id,
      status: 'completed'
    });

    if (!conversions.length) {
      return res.status(404).json({ success: false, message: 'No completed conversions found' });
    }

    const filesToZip = conversions.map(c => ({
      path: path.join('converted', c.convertedFile.filename),
      name: c.convertedFile.filename
    }));

    const zipFileName = `batch-${Date.now()}.zip`;
    const zipPath = path.join('converted', zipFileName);

    await createZip(filesToZip, zipPath);

    res.status(200).json({
      success: true,
      data: {
        zipUrl: `/converted/${zipFileName}`,
        zipName: zipFileName
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getConversionStatus = async (req, res) => {
  try {
    const conversion = await Conversion.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!conversion) {
      return res.status(404).json({ success: false, message: 'Conversion not found' });
    }

    res.status(200).json({
      success: true,
      data: conversion
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ @desc    Download converted file (with Cross-Origin headers)
// @route   GET /api/files/download/:id
// @access  Private
exports.downloadFile = async (req, res) => {
  try {
    console.log(`\n📥 Download requested for ID: ${req.params.id}`);

    const conversion = await Conversion.findById(req.params.id);

    if (!conversion) {
      console.log(`❌ Conversion not found in DB: ${req.params.id}`);
      return res.status(404).json({ success: false, message: 'File record not found' });
    }

    console.log(`✅ Conversion found in DB:`, {
      id: conversion._id,
      status: conversion.status,
      filePath: conversion.convertedFile?.path,
      filename: conversion.convertedFile?.filename,
      userId: conversion.userId
    });

    if (conversion.userId.toString() !== req.user.id.toString()) {
      console.log(`❌ Unauthorized: User ${req.user.id} tried to access file of user ${conversion.userId}`);
      return res.status(403).json({ success: false, message: 'Unauthorized access to this file' });
    }

    const filePath = conversion.convertedFile?.path;

    if (!filePath) {
      console.log(`❌ No file path in database for conversion: ${req.params.id}`);
      return res.status(404).json({ success: false, message: 'File path not found in database' });
    }

    console.log(`📁 Checking file path: ${filePath}`);

    let absolutePath = filePath;
    if (!path.isAbsolute(filePath)) {
      absolutePath = path.resolve(filePath);
      console.log(`📁 Converted to absolute path: ${absolutePath}`);
    }

    let fileExists = fs.existsSync(absolutePath);
    console.log(`📁 File exists: ${fileExists}`);

    if (!fileExists) {
      console.log(`❌ File not found at: ${absolutePath}`);

      const baseFilename = path.basename(filePath);
      const searchPaths = [
        path.join(process.cwd(), 'uploads', baseFilename),
        path.join(process.cwd(), 'converted', baseFilename),
        path.join(process.cwd(), 'temp', baseFilename)
      ];

      console.log('🔍 Searching in alternative locations:');
      for (const altPath of searchPaths) {
        console.log(`   Checking: ${altPath}`);
        if (fs.existsSync(altPath)) {
          console.log(`✅ Found file at: ${altPath}`);
          absolutePath = altPath;
          fileExists = true;
          break;
        }
      }
    }

    if (!fileExists) {
      return res.status(404).json({
        success: false,
        error: 'File not found on server',
        path: filePath,
        message: 'The file may have been deleted or expired'
      });
    }

    const stats = fs.statSync(absolutePath);
    console.log(`📁 File stats:`, {
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime
    });

    const filename = conversion.convertedFile.filename || path.basename(absolutePath);

    // ✅ Cross-Origin headers for blob download
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', conversion.convertedFile.mimetype || 'application/octet-stream');
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

    console.log(`✅ Sending file: ${filename}\n`);
    res.sendFile(absolutePath);

  } catch (error) {
    console.error('❌ Download error:', error);
    res.status(500).json({ success: false, message: 'Download failed: ' + error.message });
  }
};
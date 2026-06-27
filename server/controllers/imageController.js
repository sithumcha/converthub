const Conversion = require('../models/Conversion');
const { incrementUsage } = require('../middleware/usageMiddleware');
const conversionQueue = require('../config/queue');
const path = require('path');
const imageService = require('../services/imageService');
const fs = require('fs/promises');
const archiver = require('archiver');
const fsSync = require('fs');

/**
 * Convert or Compress Image
 * POST /api/images/convert
 */
exports.processImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file' });
    }

    const { targetFormat, quality, width, height } = req.body;
    
    // Default target format to current if not provided (for compression only)
    const originalExt = path.extname(req.file.originalname).toLowerCase().replace('.', '');
    const format = targetFormat || (originalExt === 'jpeg' ? 'jpg' : originalExt);

    // Create pending record
    const conversion = await Conversion.create({
      userId: req.user.id,
      type: 'image-process',
      originalFiles: [{
        filename: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype
      }],
      status: 'pending'
    });

    const job = await conversionQueue.add({
      type: 'image-process',
      filePath: req.file.path,
      targetFormat: format,
      options: {
        quality: quality || 80,
        width: width || null,
        height: height || null
      },
      userId: req.user.id,
      conversionId: conversion._id
    });

    res.status(202).json({
      success: true,
      message: 'Image processing started',
      jobId: job.id,
      conversionId: conversion._id,
      data: conversion
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Remove Background using AI
 * POST /api/images/remove-bg
 */
exports.removeBackground = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file' });
    }

    if (!process.env.PHOTOROOM_API_KEY) {
      return res.status(500).json({ success: false, message: 'PhotoRoom API key is not configured' });
    }

    // Create pending record
    const conversion = await Conversion.create({
      userId: req.user.id,
      type: 'image-remove-bg',
      originalFiles: [{
        filename: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype
      }],
      status: 'pending'
    });

    const job = await conversionQueue.add({
      type: 'image-remove-bg',
      filePath: req.file.path,
      userId: req.user.id,
      conversionId: conversion._id
    });

    res.status(202).json({
      success: true,
      message: 'Background removal started',
      jobId: job.id,
      conversionId: conversion._id,
      data: conversion
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Batch Process Images
 * POST /api/images/batch
 */
exports.batchProcess = async (req, res, next) => {
  try {
    if (req.user.tier !== 'pro') {
      return res.status(403).json({ message: 'Batch processing is a PRO feature.' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const format = req.body.format || 'jpeg';
    const zipPath = path.join(__dirname, '..', 'converted', `batch-${Date.now()}.zip`);
    const output = fsSync.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      res.json({ success: true, fileUrl: `/converted/${path.basename(zipPath)}` });
    });

    archive.on('error', (err) => { throw err; });
    archive.pipe(output);

    for (const file of req.files) {
      const options = { format, width: req.body.width, height: req.body.height };
      const outPath = await imageService.convertImage(file.path, options);
      archive.file(outPath, { name: path.basename(outPath) });
    }

    await archive.finalize();

  } catch (error) {
    next(error);
  }
};

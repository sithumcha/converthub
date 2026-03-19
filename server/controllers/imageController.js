const Conversion = require('../models/Conversion');
const { incrementUsage } = require('../middleware/usageMiddleware');
const conversionQueue = require('../config/queue');
const path = require('path');

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

    if (!process.env.REMOVE_BG_KEY) {
      return res.status(500).json({ success: false, message: 'Remove.bg API key is not configured' });
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

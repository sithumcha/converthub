const conversionQueue = require('../config/queue');
const Conversion = require('../models/Conversion');

exports.extractAudio = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a video file' });
    }

    const { socketId } = req.body;

    const conversion = await Conversion.create({
      userId: req.user.id,
      type: 'video-to-audio',
      originalFiles: [{
        filename: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype
      }],
      status: 'pending'
    });

    const job = await conversionQueue.add({
      type: 'video-to-audio',
      filePath: req.file.path,
      originalName: req.file.originalname,
      userId: req.user.id,
      conversionId: conversion._id,
      socketId
    });

    res.status(202).json({
      success: true,
      message: 'Video to audio extraction started',
      jobId: job.id,
      conversionId: conversion._id,
      data: conversion
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.compressVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a video file' });
    }

    const { socketId } = req.body;

    const conversion = await Conversion.create({
      userId: req.user.id,
      type: 'video-compress',
      originalFiles: [{
        filename: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype
      }],
      status: 'pending'
    });

    const job = await conversionQueue.add({
      type: 'video-compress',
      filePath: req.file.path,
      originalName: req.file.originalname,
      userId: req.user.id,
      conversionId: conversion._id,
      socketId
    });

    res.status(202).json({
      success: true,
      message: 'Video compression started',
      jobId: job.id,
      conversionId: conversion._id,
      data: conversion
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

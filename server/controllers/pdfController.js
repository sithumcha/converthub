const pdfService = require('../services/pdfService');
const { incrementUsage } = require('../middleware/usageMiddleware');
const conversionQueue = require('../config/queue');
const path = require('path');
const fs = require('fs-extra');
const Conversion = require('../models/Conversion');

/**
 * Merge multiple PDFs
 * POST /api/pdf/merge
 */
exports.mergePDFs = async (req, res) => {
  try {
    if (!req.files || req.files.length < 2) {
      return res.status(400).json({ success: false, message: 'Please upload at least 2 PDF files' });
    }

    const conversion = await Conversion.create({
      userId: req.user.id,
      type: 'pdf-merge',
      originalFiles: req.files.map(f => ({
        filename: f.originalname,
        path: f.path,
        size: f.size,
        mimetype: f.mimetype
      })),
      status: 'pending'
    });

    const job = await conversionQueue.add({
      type: 'pdf-merge',
      filePath: req.files.map(f => f.path),
      userId: req.user.id,
      conversionId: conversion._id
    });

    res.status(202).json({
      success: true,
      message: 'PDF merge started',
      jobId: job.id,
      conversionId: conversion._id,
      data: conversion
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Split a PDF into individual pages
 * POST /api/pdf/split
 */
exports.splitPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF file' });
    }

    const { pages } = req.body;
    const conversion = await Conversion.create({
      userId: req.user.id,
      type: 'pdf-split',
      originalFiles: [{
        filename: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype
      }],
      status: 'pending'
    });

    const job = await conversionQueue.add({
      type: 'pdf-split',
      filePath: req.file.path,
      pages: pages || null,
      userId: req.user.id,
      conversionId: conversion._id
    });

    res.status(202).json({
      success: true,
      message: 'PDF split started',
      jobId: job.id,
      conversionId: conversion._id,
      data: conversion
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Compress PDF
 * POST /api/pdf/compress
 */
exports.compressPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF file' });
    }

    const { quality } = req.body;
    const conversion = await Conversion.create({
      userId: req.user.id,
      type: 'pdf-compress',
      originalFiles: [{
        filename: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype
      }],
      status: 'pending'
    });

    const job = await conversionQueue.add({
      type: 'pdf-compress',
      filePath: req.file.path,
      originalName: req.file.originalname,
      options: { quality: quality || 'medium' },
      userId: req.user.id,
      conversionId: conversion._id
    });

    res.status(202).json({
      success: true,
      message: 'PDF compression started',
      jobId: job.id,
      conversionId: conversion._id,
      data: conversion
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Convert PDF to DOCX
 * POST /api/pdf/to-docx
 */
exports.convertPDFToDocx = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF file' });
    }

    const conversion = await Conversion.create({
      userId: req.user.id,
      type: 'pdf-to-docx',
      originalFiles: [{
        filename: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype
      }],
      status: 'pending'
    });

    const job = await conversionQueue.add({
      type: 'pdf-to-docx',
      filePath: req.file.path,
      originalName: req.file.originalname,
      userId: req.user.id,
      conversionId: conversion._id
    });

    res.status(202).json({
      success: true,
      message: 'PDF to Word conversion started',
      jobId: job.id,
      conversionId: conversion._id,
      data: conversion
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Password protect PDF
 * POST /api/pdf/protect
 */
exports.protectPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF file' });
    }

    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required' });
    }

    const conversion = await Conversion.create({
      userId: req.user.id,
      type: 'pdf-compress', // Ensure this matches user's schema enum if 'pdf-protect' isn't there
      originalFiles: [{
        filename: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype
      }],
      options: { password },
      status: 'pending'
    });

    const job = await conversionQueue.add({
      type: 'pdf-protect',
      filePath: req.file.path,
      originalName: req.file.originalname,
      options: { password },
      userId: req.user.id,
      conversionId: conversion._id
    });

    res.status(202).json({
      success: true,
      message: 'PDF protection started',
      jobId: job.id,
      conversionId: conversion._id,
      data: conversion
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

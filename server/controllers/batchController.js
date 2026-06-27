const archiver = require('archiver');
const fs = require('fs-extra');
const path = require('path');
const imageService = require('../services/imageService');
const Conversion = require('../models/Conversion');
const { getIO } = require('../socket');

exports.processBatch = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files provided for batch processing' });
    }

    const { action, socketId } = req.body;
    const outputDir = 'converted';
    await fs.ensureDir(outputDir);

    const zipFileName = `batch_${Date.now()}.zip`;
    const zipFilePath = path.join(outputDir, zipFileName);

    const conversion = await Conversion.create({
      userId: req.user.id,
      type: 'batch-process',
      originalFiles: req.files.map(f => ({
        filename: f.originalname,
        path: f.path,
        size: f.size,
        mimetype: f.mimetype
      })),
      status: 'processing'
    });

    // Process files and create ZIP asynchronously to avoid blocking
    (async () => {
      try {
        const io = getIO();
        const totalFiles = req.files.length;
        const processedPaths = [];

        for (let i = 0; i < totalFiles; i++) {
          const file = req.files[i];
          let result;

          if (action === 'image-compress') {
            result = await imageService.compressImage(file.path, 80);
            processedPaths.push({ name: result.fileName, path: result.path });
          } else if (action === 'image-to-webp') {
            result = await imageService.convertImage(file.path, 'webp', { quality: 80 });
            processedPaths.push({ name: result.fileName, path: result.path });
          } else if (action === 'remove-bg') {
            result = await imageService.removeBackground(file.path);
            processedPaths.push({ name: result.fileName, path: result.path });
          } else {
             // fallback to original if unknown action
             processedPaths.push({ name: file.originalname, path: file.path });
          }

          if (socketId) {
            io.to(socketId).emit('batch-progress', {
              conversionId: conversion._id,
              percent: Math.round(((i + 1) / totalFiles) * 80) // 80% for processing
            });
          }
        }

        // Create Zip
        const output = fs.createWriteStream(zipFilePath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', async () => {
          const stats = await fs.stat(zipFilePath);
          
          await Conversion.findByIdAndUpdate(conversion._id, {
            status: 'completed',
            progress: 100,
            completedAt: Date.now(),
            convertedFile: {
              filename: zipFileName,
              path: zipFilePath,
              size: stats.size,
              mimetype: 'application/zip',
              downloadUrl: `${process.env.SERVER_URL || 'http://localhost:5000'}/converted/${zipFileName}`
            }
          });

          if (socketId) {
            io.to(socketId).emit('batch-progress', { conversionId: conversion._id, percent: 100, completed: true });
          }
        });

        archive.on('error', (err) => {
          throw err;
        });

        archive.pipe(output);

        for (const f of processedPaths) {
          archive.file(f.path, { name: f.name });
        }

        await archive.finalize();

      } catch (err) {
        console.error('Batch Processing Error:', err);
        await Conversion.findByIdAndUpdate(conversion._id, {
          status: 'failed',
          error: { message: err.message }
        });
      }
    })();

    res.status(202).json({
      success: true,
      message: 'Batch processing started',
      conversionId: conversion._id,
      data: conversion
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

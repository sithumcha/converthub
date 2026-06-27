const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const path = require('path');
const fs = require('fs-extra');
const { getIO } = require('../socket');

// Tell fluent-ffmpeg where the ffmpeg binary is
ffmpeg.setFfmpegPath(ffmpegStatic);

const outputDir = 'converted';

const mediaService = {
  extractAudio: async (videoPath, socketId, conversionId) => {
    await fs.ensureDir(outputDir);
    const fileName = `audio_${Date.now()}.mp3`;
    const outputPath = path.join(outputDir, fileName);

    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .toFormat('mp3')
        .on('progress', (progress) => {
          if (socketId) {
            try {
              const io = getIO();
              io.to(socketId).emit('conversion-progress', {
                conversionId,
                percent: Math.round(progress.percent || 0)
              });
            } catch (err) {
              console.error('Socket error:', err);
            }
          }
        })
        .on('end', async () => {
          try {
            const stats = await fs.stat(outputPath);
            resolve({
              fileName,
              path: outputPath,
              size: stats.size,
              mimetype: 'audio/mpeg'
            });
          } catch (err) {
            reject(err);
          }
        })
        .on('error', (err) => {
          console.error('FFmpeg Error:', err);
          reject(new Error('Failed to extract audio from video'));
        })
        .save(outputPath);
    });
  },

  compressVideo: async (videoPath, socketId, conversionId) => {
    await fs.ensureDir(outputDir);
    const fileName = `compressed_${Date.now()}.mp4`;
    const outputPath = path.join(outputDir, fileName);

    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .videoCodec('libx264')
        .addOptions(['-crf 28']) // Higher CRF = lower quality = smaller file (23 is default, 28 is good for web compression)
        .on('progress', (progress) => {
          if (socketId) {
            try {
              const io = getIO();
              io.to(socketId).emit('conversion-progress', {
                conversionId,
                percent: Math.round(progress.percent || 0)
              });
            } catch (err) {
              console.error('Socket error:', err);
            }
          }
        })
        .on('end', async () => {
          try {
            const stats = await fs.stat(outputPath);
            resolve({
              fileName,
              path: outputPath,
              size: stats.size,
              mimetype: 'video/mp4'
            });
          } catch (err) {
            reject(err);
          }
        })
        .on('error', (err) => {
          console.error('FFmpeg Error:', err);
          reject(new Error('Failed to compress video'));
        })
        .save(outputPath);
    });
  }
};

module.exports = mediaService;

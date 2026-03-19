const mongoose = require('mongoose');

const conversionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      'pdf-merge',
      'pdf-split', 
      'pdf-compress',
      'pdf-to-docx',
      'pdf-to-jpg',
      'jpg-to-pdf',
      'image-convert',
      'image-compress',
      'image-resize',
      'remove-bg',
      'image-remove-bg',
      'batch-process',
      'file-convert',
      'image-process',
      'ocr',
      'ocr-export',
      'summarize'
    ],
    required: true,
    index: true
  },
  originalFormat: String,
  targetFormat: String,
  originalFiles: [{
    filename: String,
    path: String,
    size: Number,
    mimetype: String
  }],
  convertedFile: {
    filename: String,
    path: String,
    size: Number,
    mimetype: String,
    downloadUrl: String
  },
  options: {
    type: mongoose.Schema.Types.Mixed, // For format, quality, etc.
    default: {}
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
    index: true
  },
  progress: {
    type: Number,
    default: 0
  },
  extractedText: {
    type: String,
    default: ''
  },
  summaryText: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    default: 'eng'
  },
  error: {
    message: String,
    stack: String
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  completedAt: Date,
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 24*60*60*1000) // 24 hours
  }
});

// Auto-delete old files
conversionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Conversion', conversionSchema);



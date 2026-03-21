const Queue = require('bull');
const path = require('path');
const fs = require('fs-extra');
const { convertImage } = require('../services/imageService');
const { convertDocument } = require('../services/docService');
const pdfService = require('../services/pdfService');
const imageService = require('../services/imageService');
const Conversion = require('../models/Conversion');
const User = require('../models/User');

const REDIS_ENABLED = process.env.REDIS_ENABLED === 'true';

let conversionQueue;

if (!REDIS_ENABLED) {
  console.log('⚠️ Redis is disabled (REDIS_ENABLED=false). Queue system will not be active.');

  // Create a mock queue object
  conversionQueue = {
    add: async (data) => {
      console.log('📝 [MOCK QUEUE] Job added (but not processed):', data.type);
      return { id: 'mock-job-' + Date.now() };
    },
    on: () => { },
    process: () => { },
    isMock: true
  };
} else {
  const redisConfig = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null,
  };

  if (process.env.REDIS_TLS === 'true') {
    redisConfig.tls = {
      rejectUnauthorized: false
    };
  }

  console.log('📡 [DEBUG] Redis Configuration:', {
    host: redisConfig.host,
    port: redisConfig.port,
    hasPassword: !!redisConfig.password,
    tls: !!redisConfig.tls
  });

  conversionQueue = new Queue('conversion', {
    redis: redisConfig,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000
      },
      removeOnComplete: true,
      removeOnFail: false
    }
  });

  // Queue Event Handlers
  conversionQueue.on('ready', () => {
    console.log('✅ Conversion Queue is ready');
  });

  conversionQueue.on('error', (error) => {
    console.error('❌ Queue Error:', error);
  });

  conversionQueue.on('failed', (job, err) => {
    console.error(`❌ Job ${job.id} failed: ${err.message}`);
  });

  conversionQueue.on('completed', (job, result) => {
    console.log(`✨ Job ${job.id} completed successfully`);
  });

  // Process jobs
  conversionQueue.process(5, async (job) => {
    const { type, filePath, originalName, targetFormat, options, userId, conversionId } = job.data;
    const outputDir = 'converted';
    const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5000';

    try {
      if (!fs.existsSync(outputDir)) {
        await fs.ensureDir(outputDir);
      }

      console.log(`Processing job ${job.id} of type ${type}`);
      if (conversionId) await Conversion.findByIdAndUpdate(conversionId, { status: 'processing', progress: 10 });

      let result;

      switch (type) {
        case 'file-convert':
          const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(path.extname(originalName || '').toLowerCase().replace('.', ''));
          result = isImage ? await convertImage(filePath, targetFormat) : await convertDocument(filePath, targetFormat);
          break;

        case 'pdf-merge':
          const mergeName = `merged_${Date.now()}.pdf`;
          const mergePath = path.join(outputDir, mergeName);
          await pdfService.mergePDFs(filePath, mergePath);
          result = { fileName: mergeName, path: mergePath, size: (await fs.stat(mergePath)).size, mimetype: 'application/pdf' };
          break;

        case 'pdf-split':
          result = await pdfService.splitPDF(filePath, outputDir, job.data.pages);
          // Result for split can be an array. We take the first or wrap it.
          // For simplicity in the universal schema, if it's multiple files, we might need a zip or just return the first.
          // Let's handle split by returning the array and letting the schema store it.
          if (Array.isArray(result)) {
            result = {
              fileName: result[0].fileName || result[0],
              path: path.join(outputDir, result[0].fileName || result[0]),
              size: 0, // Placeholder
              mimetype: 'application/pdf',
              allFiles: result
            };
          }
          break;

        case 'pdf-compress':
          const compressName = `compressed_${Date.now()}_${originalName || 'file.pdf'}`;
          const compressPath = path.join(outputDir, compressName);
          await pdfService.compressPDF(filePath, compressPath, options?.quality || 'medium');
          result = { fileName: compressName, path: compressPath, size: (await fs.stat(compressPath)).size, mimetype: 'application/pdf' };
          break;

        case 'pdf-to-docx':
          const docxName = path.basename(originalName || 'file.pdf', '.pdf') + '.docx';
          const docxPath = path.join(outputDir, docxName);
          await pdfService.pdfToDocx(filePath, docxPath);
          result = { fileName: docxName, path: docxPath, size: (await fs.stat(docxPath)).size, mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };
          break;

        case 'pdf-protect':
          const protectName = `protected_${Date.now()}_${originalName || 'file.pdf'}`;
          const protectPath = path.join(outputDir, protectName);
          await pdfService.protectPDF(filePath, protectPath, options.password);
          result = { fileName: protectName, path: protectPath, size: (await fs.stat(protectPath)).size, mimetype: 'application/pdf' };
          break;

        case 'image-process':
          result = await imageService.convertImage(filePath, targetFormat, options);
          break;

        case 'image-remove-bg':
          result = await imageService.removeBackground(filePath);
          break;

        default:
          throw new Error(`Unknown job type: ${type}`);
      }

      if (conversionId) {
        const updateData = {
          status: 'completed',
          progress: 100,
          completedAt: Date.now()
        };

        if (result.fileName) {
          updateData.convertedFile = {
            filename: result.fileName,
            path: result.path,
            size: result.size,
            mimetype: result.mimetype || '',
            downloadUrl: `${SERVER_URL}/converted/${result.fileName}`
          };
        }

        if (result.extractedText !== undefined) {
          updateData.extractedText = result.extractedText;
        }

        if (result.summaryText !== undefined) {
          updateData.summaryText = result.summaryText;
        }

        await Conversion.findByIdAndUpdate(conversionId, updateData);
      }


      if (userId) {
        await User.findByIdAndUpdate(userId, {
          $inc: { dailyConversions: 1, monthlyConversions: 1 },
          lastConversionDate: new Date()
        });
      }

      return result;
    } catch (err) {
      console.error(`Job ${job.id} failed:`, err);
      if (conversionId) {
        await Conversion.findByIdAndUpdate(conversionId, {
          status: 'failed',
          error: { message: err.message, stack: err.stack }
        });
      }
      throw err;
    }
  });
}

module.exports = conversionQueue;

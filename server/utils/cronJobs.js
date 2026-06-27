const cron = require('node-cron');
const fs = require('fs/promises');
const path = require('path');
const logger = require('./logger');

const CLEANUP_DIRS = [
  path.join(__dirname, '..', 'uploads'),
  path.join(__dirname, '..', 'converted')
];

// Files older than 24 hours
const MAX_AGE_MS = 24 * 60 * 60 * 1000; 

const cleanupOldFiles = async () => {
  const now = Date.now();
  let deletedCount = 0;

  for (const dir of CLEANUP_DIRS) {
    try {
      const files = await fs.readdir(dir);
      
      for (const file of files) {
        if (file === '.gitkeep') continue;
        
        const filePath = path.join(dir, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtimeMs > MAX_AGE_MS) {
          await fs.unlink(filePath);
          deletedCount++;
        }
      }
    } catch (err) {
      if (err.code !== 'ENOENT') {
        logger.error(`Error cleaning up directory ${dir}:`, { error: err });
      }
    }
  }

  if (deletedCount > 0) {
    logger.info(`Cron Cleanup: Deleted ${deletedCount} old files.`);
  }
};

const initCronJobs = () => {
  // Run every hour
  cron.schedule('0 * * * *', () => {
    logger.info('Running hourly cleanup job...');
    cleanupOldFiles();
  });
  logger.info('Cron jobs initialized successfully.');
};

module.exports = { initCronJobs };

const archiver = require('archiver');
const fs = require('fs');
const path = require('path');

const createZip = (files, outputPath) => {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    output.on('close', () => resolve(outputPath));
    archive.on('error', (err) => reject(err));

    archive.pipe(output);

    files.forEach(file => {
      if (fs.existsSync(file.path)) {
        archive.file(file.path, { name: file.name });
      }
    });

    archive.finalize();
  });
};

module.exports = { createZip };

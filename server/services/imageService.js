const sharp = require('sharp');
const path = require('path');
const fs = require('fs-extra');

const imageService = {
  /**
   * Convert image to target format with options
   * @param {string} inputPath - Source file path
   * @param {string} targetFormat - Format to convert to (jpg, png, webp, gif, avif)
   * @param {Object} options - { quality, width, height, fit, crop }
   */
  convertImage: async (inputPath, targetFormat, options = {}) => {
    const outputDir = 'converted';
    await fs.ensureDir(outputDir);

    const ext = targetFormat.toLowerCase();
    const fileName = `proc_${Date.now()}_${path.basename(inputPath, path.extname(inputPath))}.${ext}`;
    const outputPath = path.join(outputDir, fileName);

    let transform = sharp(inputPath);

    // Apply Crop if provided
    if (options.crop) {
      const { left, top, width, height } = options.crop;
      transform = transform.extract({ left, top, width, height });
    }

    // Handle resizing if width or height is provided
    if (options.width || options.height) {
      transform = transform.resize({
        width: options.width ? parseInt(options.width) : null,
        height: options.height ? parseInt(options.height) : null,
        fit: options.fit || 'cover',
        withoutEnlargement: true
      });
    }

    // Format specific optimizations
    const quality = options.quality ? parseInt(options.quality) : 80;

    switch (ext) {
      case 'jpg':
      case 'jpeg':
        transform = transform.jpeg({ quality, mozjpeg: true });
        break;
      case 'png':
        transform = transform.png({ quality, compressionLevel: 9 });
        break;
      case 'webp':
        transform = transform.webp({ quality, effort: 6 });
        break;
      case 'gif':
        transform = transform.gif();
        break;
      case 'avif':
        transform = transform.avif({ quality, effort: 4 });
        break;
      default:
        throw new Error(`Unsupported target format: ${ext}`);
    }

    await transform.toFile(outputPath);

    return {
      fileName,
      path: outputPath,
      size: (await fs.stat(outputPath)).size
    };
  },

  /**
   * Specialized Image Compression
   */
  compressImage: async (inputPath, quality = 80) => {
    const ext = path.extname(inputPath).toLowerCase().replace('.', '') || 'jpg';
    return await imageService.convertImage(inputPath, ext, { quality });
  },

  /**
   * Specialized Image Resize
   */
  resizeImage: async (inputPath, width, height, options = {}) => {
    const ext = path.extname(inputPath).toLowerCase().replace('.', '') || 'jpg';
    return await imageService.convertImage(inputPath, ext, { width, height, ...options });
  },

  /**
   * Specialized Image Crop
   */
  cropImage: async (inputPath, left, top, width, height) => {
    const ext = path.extname(inputPath).toLowerCase().replace('.', '') || 'jpg';
    return await imageService.convertImage(inputPath, ext, { crop: { left, top, width, height } });
  },

  /**
   * Remove background from an image using remove.bg API
   * @param {string} inputPath - Source file path
   * @returns {Object} - Result with new file path
   */
  removeBackground: async (inputPath) => {
    const axios = require('axios');
    const FormData = require('form-data');
    
    const outputDir = 'converted';
    await fs.ensureDir(outputDir);

    const fileName = `no-bg_${Date.now()}_${path.basename(inputPath, path.extname(inputPath))}.png`;
    const outputPath = path.join(outputDir, fileName);

    const formData = new FormData();
    formData.append('image_file', fs.createReadStream(inputPath));
    formData.append('size', 'auto');

    try {
      const response = await axios.post('https://api.remove.bg/v1.0/removebg', formData, {
        headers: {
          ...formData.getHeaders(),
          'X-Api-Key': process.env.REMOVE_BG_KEY,
        },
        responseType: 'arraybuffer',
      });

      await fs.writeFile(outputPath, response.data);

      return {
        fileName,
        path: outputPath,
        size: response.data.length
      };
    } catch (error) {
      console.error('Error removing background:', error.response?.data?.toString() || error.message);
      throw new Error('Failed to remove image background. Check your API key.');
    }
  }
};

module.exports = imageService;


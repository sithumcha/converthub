const puppeteer = require('puppeteer');
const googleTTS = require('google-tts-api');
const path = require('path');
const fs = require('fs/promises');
const axios = require('axios');

const extraService = {
  /**
   * Capture a website as a PDF or Image
   * @param {string} url - The URL to capture
   * @param {string} type - 'pdf' or 'image'
   * @returns {Object} { path, fileName, mimetype }
   */
  captureWebsite: async (url, type = 'pdf') => {
    const outputDir = 'converted';
    // Use standard fs module to check/create dir
    const fsSync = require('fs');
    if (!fsSync.existsSync(outputDir)) {
      fsSync.mkdirSync(outputDir, { recursive: true });
    }

    const browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

      const timestamp = Date.now();
      let outputPath, fileName, mimetype;

      if (type === 'pdf') {
        fileName = `web_${timestamp}.pdf`;
        outputPath = path.join(outputDir, fileName);
        await page.pdf({ path: outputPath, format: 'A4', printBackground: true });
        mimetype = 'application/pdf';
      } else {
        fileName = `web_${timestamp}.png`;
        outputPath = path.join(outputDir, fileName);
        await page.screenshot({ path: outputPath, fullPage: true });
        mimetype = 'image/png';
      }

      return { path: outputPath, fileName, mimetype };
    } finally {
      await browser.close();
    }
  },

  /**
   * Generate Speech from Text
   * @param {string} text - The text to speak
   * @param {string} lang - The language code (e.g., 'en', 'si')
   * @returns {Object} { path, fileName, mimetype }
   */
  generateSpeech: async (text, lang = 'en') => {
    const outputDir = 'converted';
    const fsSync = require('fs');
    if (!fsSync.existsSync(outputDir)) {
      fsSync.mkdirSync(outputDir, { recursive: true });
    }

    const fileName = `tts_${Date.now()}.mp3`;
    const outputPath = path.join(outputDir, fileName);

    // Get the audio base64 from google-tts-api
    // (If the text is long, it should be chunked, but for simplicity we'll just use getAudioBase64)
    // google-tts-api has a limit of 200 characters per request.
    
    // We will chunk the text into sentences
    const results = await googleTTS.getAllAudioBase64(text, {
      lang: lang,
      slow: false,
      host: 'https://translate.google.com',
      timeout: 10000,
    });

    // results is an array of { base64, shortText }
    // We will combine the base64 chunks into a single buffer and save it
    
    const buffers = results.map(res => Buffer.from(res.base64, 'base64'));
    const combinedBuffer = Buffer.concat(buffers);
    
    await fs.writeFile(outputPath, combinedBuffer);

    return { 
      path: outputPath, 
      fileName, 
      mimetype: 'audio/mpeg',
      base64: combinedBuffer.toString('base64')
    };
  }
};

module.exports = extraService;

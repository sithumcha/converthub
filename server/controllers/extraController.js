const extraService = require('../services/extraService');

exports.captureWebsite = async (req, res, next) => {
  try {
    const { url, type } = req.body;
    
    if (!url) {
      return res.status(400).json({ success: false, message: 'URL is required' });
    }
    
    // Basic URL validation
    let validUrl = url;
    if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
      validUrl = 'https://' + validUrl;
    }

    const result = await extraService.captureWebsite(validUrl, type || 'pdf');
    
    res.json({
      success: true,
      message: 'Website captured successfully',
      data: {
        filename: result.fileName,
        mimetype: result.mimetype
      }
    });
  } catch (error) {
    console.error('Capture Error:', error);
    res.status(500).json({ success: false, message: 'Failed to capture website. Make sure the URL is accessible.' });
  }
};

exports.generateSpeech = async (req, res, next) => {
  try {
    const { text, lang } = req.body;
    
    if (!text) {
      return res.status(400).json({ success: false, message: 'Text is required' });
    }

    const result = await extraService.generateSpeech(text, lang || 'en');
    
    res.json({
      success: true,
      message: 'Speech generated successfully',
      data: {
        filename: result.fileName,
        mimetype: result.mimetype,
        base64: result.base64
      }
    });
  } catch (error) {
    console.error('TTS Error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate speech.' });
  }
};

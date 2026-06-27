const aiService = require('../services/aiService');
const fs = require('fs/promises');

const summarize = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No PDF file uploaded' });
    }

    const summary = await aiService.summarizeDocument(req.file.path);
    
    // We keep the file if they want to chat next, but ideally cleanup handles it.
    
    res.json({ success: true, summary, filePath: req.file.path });
  } catch (error) {
    next(error);
  }
};

const chat = async (req, res, next) => {
  try {
    const { filePath, question } = req.body;

    if (!filePath || !question) {
      return res.status(400).json({ message: 'filePath and question are required' });
    }

    const answer = await aiService.chatWithDocument(filePath, question);
    
    res.json({ success: true, answer });
  } catch (error) {
    next(error);
  }
};

const extractText = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    const text = await aiService.extractTextFromImage(req.file.path);
    
    // Cleanup immediately after extraction
    fs.unlink(req.file.path).catch(console.error);

    res.json({ success: true, text });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  summarize,
  chat,
  extractText
};

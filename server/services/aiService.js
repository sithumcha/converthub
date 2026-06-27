const { GoogleGenerativeAI } = require('@google/generative-ai');
const pdfParse = require('pdf-parse');
const fs = require('fs/promises');
const logger = require('../utils/logger');

const getGenAI = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured in the environment variables.');
  }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

const extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('PDF PARSE ACTUAL ERROR:', error);
    logger.error('Failed to extract text from PDF', { error: error.message || error });
    throw new Error('Failed to extract text from PDF file: ' + (error.message || error));
  }
};

const summarizeDocument = async (filePath) => {
  const text = await extractTextFromPDF(filePath);
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  
  // Limiting text to avoid token limits for extremely large PDFs.
  // Gemini 1.5 has 1M token limit, but this keeps requests fast and reasonable.
  const limitedText = text.substring(0, 100000); 
  const prompt = `Please provide a comprehensive but concise summary of the following document. Highlight the main points and key takeaways:\n\n${limitedText}`;
  
  const result = await model.generateContent(prompt);
  return result.response.text();
};

const chatWithDocument = async (filePath, question) => {
  const text = await extractTextFromPDF(filePath);
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  
  const limitedText = text.substring(0, 100000);
  const prompt = `You are an AI assistant helping a user understand a document.\n\nContext from document:\n${limitedText}\n\nBased on the document context above, answer this question: ${question}`;
  
  const result = await model.generateContent(prompt);
  return result.response.text();
};

const extractTextFromImage = async (imagePath) => {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  
  const mimeType = imagePath.endsWith('.png') ? 'image/png' 
                 : imagePath.endsWith('.webp') ? 'image/webp' 
                 : 'image/jpeg';
                 
  const imageBuffer = await fs.readFile(imagePath);
  
  const imageParts = [
    {
      inlineData: {
        data: imageBuffer.toString("base64"),
        mimeType
      }
    }
  ];
  
  const prompt = "Extract all text from this image exactly as it appears. If there is formatting like tables or lists, try to preserve it using Markdown. If there is no text, reply with 'No text found in the image.'";
  
  const result = await model.generateContent([prompt, ...imageParts]);
  return result.response.text();
};

module.exports = {
  summarizeDocument,
  chatWithDocument,
  extractTextFromImage
};

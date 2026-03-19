const { PDFDocument } = require('pdf-lib');
const fs = require('fs-extra');
const path = require('path');
const { PDFParse } = require('pdf-parse');
const { Document, Packer, Paragraph, TextRun } = require('docx');
const { encrypt } = require('@pdfsmaller/pdf-encrypt-lite');

const pdfService = {
  /**
   * Merge multiple PDF files into one
   * @param {Array} filePaths - Array of absolute paths to PDF files
   * @param {string} outputPath - Absolute path for the merged output
   */
  mergePDFs: async (filePaths, outputPath) => {
    // Validation
    if (!filePaths || !Array.isArray(filePaths) || filePaths.length === 0) {
      throw new Error('No files provided for merging');
    }
    if (!outputPath) {
      throw new Error('Output path is required for merging');
    }

    try {
      const mergedPdf = await PDFDocument.create();

      for (const filePath of filePaths) {
        if (!filePath) continue; // Basic guard
        const pdfBytes = await fs.readFile(filePath);
        const pdf = await PDFDocument.load(pdfBytes);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      await fs.writeFile(outputPath, mergedPdfBytes);
      return outputPath;
    } catch (error) {
      console.error('Error merging PDFs:', error);
      throw new Error('Failed to merge PDF files');
    }
  },

  /**
   * Split a PDF into individual pages or specific range
   * @param {string} filePath - Path to source PDF
   * @param {string} outputDir - Directory to save split pages
   * @param {Array} [pages] - Optional array of page indices (0-indexed) to extract. If omitted, splits all.
   * @returns {Promise<Array>} - List of generated file names
   */
  splitPDF: async (filePath, outputDir, pages = null) => {
    try {
      const pdfBytes = await fs.readFile(filePath);
      const srcPdf = await PDFDocument.load(pdfBytes);
      const pageCount = srcPdf.getPageCount();
      const generatedFiles = [];
      const baseName = path.basename(filePath, '.pdf');

      // Determine which pages to extract
      const pageIndices = pages !== null ? pages : Array.from({ length: pageCount }, (_, i) => i);

      for (const index of pageIndices) {
        if (index < 0 || index >= pageCount) continue;

        const newPdf = await PDFDocument.create();
        const [page] = await newPdf.copyPages(srcPdf, [index]);
        newPdf.addPage(page);
        
        const fileName = `${baseName}_page_${index + 1}.pdf`;
        const outputPath = path.join(outputDir, fileName);
        
        const newPdfBytes = await newPdf.save();
        await fs.writeFile(outputPath, newPdfBytes);
        generatedFiles.push(fileName);
      }

      return generatedFiles;
    } catch (error) {
      console.error('Error splitting PDF:', error);
      throw new Error('Failed to split PDF file');
    }
  },

  /**
   * Compress a PDF by re-saving with optimizations
   * @param {string} filePath - Path to source PDF
   * @param {string} outputPath - Path for compressed output
   * @param {string} quality - Compression level ('low', 'medium', 'high')
   */
  compressPDF: async (filePath, outputPath, quality = 'medium') => {
    try {
      const pdfBytes = await fs.readFile(filePath);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      
      // Remove metadata to reduce size
      pdfDoc.setTitle('');
      pdfDoc.setAuthor('');
      pdfDoc.setSubject('');
      pdfDoc.setKeywords([]);
      pdfDoc.setProducer('');
      pdfDoc.setCreator('');

      // Optimization settings based on quality
      // Note: pdf-lib doesn't support DPI resizing directly without manual image processing.
      // We use useObjectStreams to optimize the internal structure.
      const useObjectStreams = quality !== 'high';
      
      const compressedBytes = await pdfDoc.save({
        useObjectStreams: useObjectStreams,
        addDefaultPage: false,
        updateFieldAppearances: false
      });

      await fs.writeFile(outputPath, compressedBytes);
      return outputPath;
    } catch (error) {
      console.error('Error compressing PDF:', error);
      throw new Error('Failed to compress PDF file');
    }
  },

  /**
   * Convert PDF to Word (DOCX)
   * @param {string} filePath - Path to source PDF
   * @param {string} outputPath - Path for generated DOCX
   */
  pdfToDocx: async (filePath, outputPath) => {
    try {
      const dataBuffer = await fs.readFile(filePath);
      const parser = new PDFParse({ data: dataBuffer });
      const data = await parser.getText();

      // Create a new DOCX document
      const doc = new Document({
        sections: [{
          properties: {},
          children: data.text.split('\n').map(line => 
            new Paragraph({
              children: [new TextRun(line.trim() || ' ')]
            })
          )
        }]
      });

      const buffer = await Packer.toBuffer(doc);
      await fs.writeFile(outputPath, buffer);
      return outputPath;
    } catch (error) {
      console.error('Error converting PDF to DOCX:', error);
      throw new Error('Failed to convert PDF to DOCX');
    }
  },

  /**
   * Add password protection to a PDF
   * @param {string} filePath - Path to source PDF
   * @param {string} outputPath - Path for protected output
   * @param {string} password - User password for opening
   */
  protectPDF: async (filePath, outputPath, password) => {
    try {
      const pdfBytes = await fs.readFile(filePath);
      
      const encryptedBytes = await encrypt(pdfBytes, {
        userPassword: password,
        ownerPassword: password + '_owner', // Basic owner password
        permissions: {
          printing: 'highResolution',
          modifying: false,
          copying: false,
          annotating: false,
          fillingForms: false,
          contentAccessibility: true,
          documentAssembly: false,
        },
      });

      await fs.writeFile(outputPath, encryptedBytes);
      return outputPath;
    } catch (error) {
      console.error('Error protecting PDF:', error);
      throw new Error('Failed to protect PDF file');
    }
  }
};

module.exports = pdfService;

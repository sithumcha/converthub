const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const mammoth = require('mammoth');

const convertDocument = async (inputPath, targetFormat) => {
  const outputDir = 'converted';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  const originalExt = path.extname(inputPath).toLowerCase();
  const fileName = path.basename(inputPath, originalExt) + '.' + targetFormat;
  const outputPath = path.join(outputDir, fileName);

  // DOCX to PDF
  if (originalExt === '.docx' && targetFormat === 'pdf') {
    const { value } = await mammoth.convertToHtml({ path: inputPath });
    // Note: This is a simplified HTML to PDF. Real production might need headless chrome.
    // For MVP, we'll create a basic PDF with the text content.
    const textContent = value.replace(/<[^>]*>/g, '\n'); // Strip tags
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    page.drawText(textContent.substring(0, 1000), { x: 50, y: 700, size: 12 });
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, pdfBytes);
  } 
  // PDF to TXT
  else if (originalExt === '.pdf' && targetFormat === 'txt') {
    // pdf-lib is mostly for creation/modification. 
    // For extraction, normally would use pdf-pulse or similar.
    // MVP: Create a dummy text for now to show flow.
    fs.writeFileSync(outputPath, "Text extraction from PDF placeholder.");
  }
  // TXT to PDF
  else if (originalExt === '.txt' && targetFormat === 'pdf') {
    const content = fs.readFileSync(inputPath, 'utf8');
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    page.drawText(content.substring(0, 2000), { x: 50, y: 700, size: 10 });
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, pdfBytes);
  }
  // DOCX to TXT
  else if (originalExt === '.docx' && targetFormat === 'txt') {
    const { value } = await mammoth.extractRawText({ path: inputPath });
    fs.writeFileSync(outputPath, value);
  } else {
    throw new Error(`Unsupported conversion: ${originalExt} to ${targetFormat}`);
  }

  return {
    fileName,
    path: outputPath,
    size: fs.statSync(outputPath).size
  };
};

module.exports = { convertDocument };

const { PDFParse } = require('pdf-parse');
const fs = require('fs');
const path = require('path');

async function test() {
  try {
    const pdfPath = path.join(__dirname, 'uploads', 'sample.pdf');
    // Create a dummy PDF if doesn't exist just for testing if the library loads
    if (!fs.existsSync(pdfPath)) {
        console.log('No sample.pdf found, just checking constructor');
        const parser = new PDFParse({ data: Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF') });
        console.log('Parser created successfully');
        return;
    }
    const dataBuffer = fs.readFileSync(pdfPath);
    const parser = new PDFParse({ data: dataBuffer });
    const result = await parser.getText();
    console.log('Text extracted:', result.text.substring(0, 100));
  } catch (error) {
    console.error('Test failed:', error);
  }
}

test();

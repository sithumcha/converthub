const pdfParse = require('pdf-parse');
console.log('Type of pdf-parse:', typeof pdfParse);
for (let key in pdfParse) {
    console.log(`Key: ${key}, Type: ${typeof pdfParse[key]}`);
}
if (typeof pdfParse !== 'function' && pdfParse.default) {
    console.log('Found .default property, type:', typeof pdfParse.default);
}

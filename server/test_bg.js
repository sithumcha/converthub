require('dotenv').config();
const imageService = require('./services/imageService');

async function testBackgroundRemoval() {
  console.log("Starting test...");
  try {
    const result = await imageService.removeBackground('../client/public/pwa-192x192.png');
    console.log("SUCCESS! Background removed successfully.");
    console.log("Saved at:", result.path);
    console.log("File size:", result.size, "bytes");
  } catch (error) {
    console.error("TEST FAILED:", error.message);
  }
}

testBackgroundRemoval();

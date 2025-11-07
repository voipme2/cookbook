import path from 'path';
import fs from 'fs';

// Use environment variable for images directory, or default based on NODE_ENV
// In production Docker, this should be /app/images (mapped to volume)
// In development, this will be <project>/api/src/images
export const IMAGES_DIR = process.env['IMAGES_DIR'] || 
  (process.env['NODE_ENV'] === 'production' 
    ? '/app/images'
    : path.join(__dirname, '../images'));

// Ensure the images directory exists
try {
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
    console.log(`Created images directory: ${IMAGES_DIR}`);
  }
} catch (err) {
  console.error(`Failed to create images directory: ${IMAGES_DIR}`, err);
}

// Ensure temp directory exists
export const TEMP_IMAGES_DIR = path.join(IMAGES_DIR, 'temp');
try {
  if (!fs.existsSync(TEMP_IMAGES_DIR)) {
    fs.mkdirSync(TEMP_IMAGES_DIR, { recursive: true });
    console.log(`Created temp images directory: ${TEMP_IMAGES_DIR}`);
  }
} catch (err) {
  console.error(`Failed to create temp images directory: ${TEMP_IMAGES_DIR}`, err);
}

// Helper function to ensure directory exists before writing
export function ensureDirectoryExists(dirPath: string): void {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`Created directory on-demand: ${dirPath}`);
    }
  } catch (err) {
    console.error(`Failed to ensure directory exists: ${dirPath}`, err);
    throw err; // Re-throw so caller knows it failed
  }
}

export default {
  IMAGES_DIR,
  TEMP_IMAGES_DIR,
  ensureDirectoryExists,
};


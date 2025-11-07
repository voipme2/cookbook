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
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// Ensure temp directory exists
export const TEMP_IMAGES_DIR = path.join(IMAGES_DIR, 'temp');
if (!fs.existsSync(TEMP_IMAGES_DIR)) {
  fs.mkdirSync(TEMP_IMAGES_DIR, { recursive: true });
}

export default {
  IMAGES_DIR,
  TEMP_IMAGES_DIR,
};


import { Router, Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { IMAGES_DIR, TEMP_IMAGES_DIR, ensureDirectoryExists } from '../config/paths';

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Sanitize filename to prevent path traversal attacks
const sanitizeFilename = (filename: string): string | null => {
  if (!filename) return null;

  // Remove any path separators and parent directory references
  const sanitized = path.basename(filename);

  // Validate that the filename only contains safe characters
  // Allow alphanumeric, hyphens, underscores, and dots
  if (!/^[a-zA-Z0-9._-]+$/.test(sanitized)) {
    return null;
  }

  // Prevent hidden files
  if (sanitized.startsWith('.')) {
    return null;
  }

  return sanitized;
};

const router = Router();

// Temporary image upload (for new recipes)
router.post('/temp', upload.single('image'), (req: Request, res: Response) => {
  try {
    const file = (req as any).file;
    
    if (!file) {
      res.status(400).json({ error: 'No image file provided.' });
      return;
    }

    // Ensure temp directory exists
    ensureDirectoryExists(TEMP_IMAGES_DIR);

    // Generate unique filename
    const tempFilename = `${uuidv4()}.jpg`;
    const tempImagePath = path.join(TEMP_IMAGES_DIR, tempFilename);

    // Save image
    fs.writeFileSync(tempImagePath, file.buffer);

    // Return the temp image URL
    const tempImageUrl = `/api/images/serve/temp/${tempFilename}`;

    res.json({
      success: true,
      image: {
        filename: tempFilename,
        path: tempImageUrl,
        size: file.size,
        mimetype: file.mimetype
      }
    });
  } catch (err) {
    console.error('Temp image upload error:', err);
    res.status(500).json({ error: 'Failed to upload temporary image.' });
  }
});

// Serve temp images
router.get('/serve/temp/:filename', (req: Request, res: Response) => {
  const filename = req.params['filename'] || '';

  // Sanitize filename to prevent path traversal
  const sanitized = sanitizeFilename(filename);
  if (!sanitized) {
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(400).send('Invalid filename');
    return;
  }

  const imagePath = path.join(TEMP_IMAGES_DIR, sanitized);
  if (fs.existsSync(imagePath)) {
    // Set proper headers for image serving
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.sendFile(imagePath);
  } else {
    // Return a 404 with proper headers instead of JSON
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(404).send('Image not found');
  }
});

// Serve images
router.get('/serve/recipes/:filename', (req: Request, res: Response) => {
  const filename = req.params['filename'] || '';

  // Sanitize filename to prevent path traversal
  const sanitized = sanitizeFilename(filename);
  if (!sanitized) {
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(400).send('Invalid filename');
    return;
  }

  const imagePath = path.join(IMAGES_DIR, sanitized);

  if (fs.existsSync(imagePath)) {
    // Set proper headers for image serving
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.sendFile(imagePath);
  } else {
    // Return a 404 with proper headers instead of JSON
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(404).send('Image not found');
  }
});

export default router; 
import { Router, Request, Response } from 'express';
import multer from 'multer';
import recipesController from '../controllers/recipesController';
import { DatabaseInterface } from '../types';

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

export default function (database: DatabaseInterface) {
  const db = database;
  const router = Router();
  
  // List recipes
  router.get('/recipes', (req: Request, res: Response) => {
    recipesController.list(req, res, db);
  });
  
  // Search recipes
  router.get('/search', async (req: Request, res: Response) => {
    try {
      const query = req.query['query'] as string;
      if (!query) {
        res.status(400).json({ error: 'Query parameter is required.' });
        return;
      }
      const results = await db.search(query);
      res.json(results);
    } catch (err) {
      res.status(500).json({ error: 'Failed to search recipes.' });
    }
  });

  // Search recipes with filters
  router.post('/search', (req: Request, res: Response) => {
    recipesController.searchWithFilters(req, res, db);
  });
  
  // Get a recipe
  router.get('/recipes/:recipeId', (req: Request, res: Response) => {
    recipesController.get(req, res, db);
  });
  
  // Create a recipe
  router.post('/recipes', (req: Request, res: Response) => {
    recipesController.create(req, res, db);
  });
  
  // Update a recipe
  router.post('/recipes/:recipeId', (req: Request, res: Response) => {
    recipesController.update(req, res, db);
  });
  
  // Upload an image for a recipe (with multer middleware)
  router.post('/recipes/:recipeId/image', upload.single('image'), (req: Request, res: Response) => {
    recipesController.uploadImage(req as any, res, db);
  });
  
  // Fetch a recipe from a URL using the scraper
  router.post('/recipes/fetch', (req: Request, res: Response) => {
    recipesController.fetchFromUrl(req, res);
  });
  
  return router;
} 
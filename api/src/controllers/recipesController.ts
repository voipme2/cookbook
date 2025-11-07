import { Request, Response } from 'express';
import { DatabaseInterface, Recipe } from '../types';
import fs from 'fs';
import path from 'path';
import { IMAGES_DIR } from '../config/paths';
// SAFE TO IGNORE: No update needed for scraper import at this time.
const scraper: any = require('../routes/scraper');

// Extend Request to include file property from multer
interface UploadRequest extends Request {
  file?: Express.Multer.File;
}

const recipesController = {
  list: async (_req: Request, res: Response, db: DatabaseInterface) => {
    try {
      const recipes = await db.list();
      res.json(recipes);
    } catch (err) {
      res.status(500).json({ error: 'Failed to list recipes.' });
    }
  },

  get: async (req: Request, res: Response, db: DatabaseInterface) => {
    try {
      const recipeId = req.params['recipeId'] ?? '';
      const recipe = await db.find(recipeId);
      if (!recipe) {
        res.status(404).json({ error: 'Recipe not found.' });
        return;
      }
      recipe.id = recipeId;
      res.json(recipe);
    } catch (err) {
      res.status(500).json({ error: 'Failed to get recipe.' });
    }
  },

  create: async (req: Request, res: Response, db: DatabaseInterface) => {
    try {
      const newRecipe: Recipe = req.body;
      const recipeId = await db.save(newRecipe);
      res.json({ id: recipeId });
    } catch (err) {
      res.status(500).json({ error: 'Failed to create recipe.' });
    }
  },

  update: async (req: Request, res: Response, db: DatabaseInterface) => {
    try {
      const recipeId = req.params['recipeId'] ?? '';
      const newRecipe: Recipe = req.body;
      newRecipe.id = recipeId;
      await db.save(newRecipe);
      res.json({ id: recipeId });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update recipe.' });
    }
  },

  uploadImage: async (req: UploadRequest, res: Response, db: DatabaseInterface) => {
    try {
      const recipeId = req.params['recipeId'] ?? '';
      
      if (!req.file) {
        res.status(400).json({ error: 'No image file provided.' });
        return;
      }

      const recipe = await db.find(recipeId);
      if (!recipe) {
        res.status(404).json({ error: 'Recipe not found.' });
        return;
      }

      // Save image with recipe ID as filename
      const imagePath = path.join(IMAGES_DIR, `${recipeId}.jpg`);
      fs.writeFileSync(imagePath, req.file.buffer);

      // Update recipe with new image URL
      const imageUrl = `/images/serve/recipes/${recipeId}.jpg`;
      recipe.imageUrl = imageUrl;
      await db.save(recipe);

      res.json({ 
        success: true,
        image: {
          filename: `${recipeId}.jpg`,
          path: imageUrl,
          size: req.file.size,
          mimetype: req.file.mimetype
        }
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to upload image.' });
    }
  },

  fetchFromUrl: async (req: Request, res: Response) => {
    try {
      const { url } = req.body;
      if (!url) {
        res.status(400).json({ error: "Missing 'url' in request body." });
        return;
      }
      const recipe = await scraper.fetch(url);
      res.json(recipe);
    } catch (err: any) {
      res.status(500).json({
        error: 'Failed to fetch recipe from URL.',
        details: err.message,
      });
    }
  },

  searchWithFilters: async (req: Request, res: Response, db: DatabaseInterface) => {
    try {
      const filters = req.body;
      const recipes = await db.searchWithFilters(filters);
      res.json(recipes);
    } catch (err) {
      res.status(500).json({ error: 'Failed to search recipes with filters.' });
    }
  },
};

export default recipesController; 
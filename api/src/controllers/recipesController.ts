import { Request, Response } from 'express';
import { DatabaseInterface, Recipe } from '../types';
import fs from 'fs';
import path from 'path';
import { IMAGES_DIR, ensureDirectoryExists } from '../config/paths';
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
      console.error('Recipe list error:', err);
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
      console.error('Recipe get error:', err);
      res.status(500).json({ error: 'Failed to get recipe.' });
    }
  },

  create: async (req: Request, res: Response, db: DatabaseInterface) => {
    try {
      const newRecipe: Recipe = req.body;

      // Validate required fields
      if (!newRecipe.name || !newRecipe.name.trim()) {
        res.status(400).json({ error: 'Recipe name is required.' });
        return;
      }

      if (!newRecipe.author || !newRecipe.author.trim()) {
        res.status(400).json({ error: 'Recipe author is required.' });
        return;
      }

      if (!newRecipe.description || !newRecipe.description.trim()) {
        res.status(400).json({ error: 'Recipe description is required.' });
        return;
      }

      if (!Array.isArray(newRecipe.ingredients) || newRecipe.ingredients.length === 0) {
        res.status(400).json({ error: 'Recipe must have at least one ingredient.' });
        return;
      }

      // Validate ingredients have text
      for (const ingredient of newRecipe.ingredients) {
        if (!ingredient.text || !ingredient.text.trim()) {
          res.status(400).json({ error: 'All ingredients must have text.' });
          return;
        }
      }

      // Validate steps have text (if steps are provided)
      if (Array.isArray(newRecipe.steps)) {
        for (const step of newRecipe.steps) {
          if (!step.text || !step.text.trim()) {
            res.status(400).json({ error: 'All steps must have text.' });
            return;
          }
        }
      }

      const recipeId = await db.save(newRecipe);
      res.json({ id: recipeId });
    } catch (err) {
      console.error('Recipe creation error:', err);
      res.status(500).json({ error: 'Failed to create recipe.' });
    }
  },

  update: async (req: Request, res: Response, db: DatabaseInterface) => {
    try {
      const recipeId = req.params['recipeId'] ?? '';

      // Check if recipe exists
      const existingRecipe = await db.find(recipeId);
      if (!existingRecipe) {
        res.status(404).json({ error: 'Recipe not found.' });
        return;
      }

      const newRecipe: Recipe = req.body;

      // Validate required fields
      if (!newRecipe.name || !newRecipe.name.trim()) {
        res.status(400).json({ error: 'Recipe name is required.' });
        return;
      }

      if (!newRecipe.author || !newRecipe.author.trim()) {
        res.status(400).json({ error: 'Recipe author is required.' });
        return;
      }

      if (!newRecipe.description || !newRecipe.description.trim()) {
        res.status(400).json({ error: 'Recipe description is required.' });
        return;
      }

      if (!Array.isArray(newRecipe.ingredients) || newRecipe.ingredients.length === 0) {
        res.status(400).json({ error: 'Recipe must have at least one ingredient.' });
        return;
      }

      // Validate ingredients have text
      for (const ingredient of newRecipe.ingredients) {
        if (!ingredient.text || !ingredient.text.trim()) {
          res.status(400).json({ error: 'All ingredients must have text.' });
          return;
        }
      }

      // Validate steps have text (if steps are provided)
      if (Array.isArray(newRecipe.steps)) {
        for (const step of newRecipe.steps) {
          if (!step.text || !step.text.trim()) {
            res.status(400).json({ error: 'All steps must have text.' });
            return;
          }
        }
      }

      newRecipe.id = recipeId;
      await db.save(newRecipe);
      res.json({ id: recipeId });
    } catch (err) {
      console.error('Recipe update error:', err);
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

      // Ensure images directory exists
      ensureDirectoryExists(IMAGES_DIR);

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
      console.error('Recipe image upload error:', err);
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
      console.error('Recipe search with filters error:', err);
      res.status(500).json({ error: 'Failed to search recipes with filters.' });
    }
  },
};

export default recipesController; 
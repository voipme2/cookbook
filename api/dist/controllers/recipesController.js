"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const scraper = require('../routes/scraper');
const recipesController = {
    list: async (_req, res, db) => {
        try {
            const recipes = await db.list();
            res.json(recipes);
        }
        catch (err) {
            res.status(500).json({ error: 'Failed to list recipes.' });
        }
    },
    get: async (req, res, db) => {
        try {
            const recipeId = req.params['recipeId'] ?? '';
            const recipe = await db.find(recipeId);
            if (!recipe) {
                res.status(404).json({ error: 'Recipe not found.' });
                return;
            }
            recipe.id = recipeId;
            res.json(recipe);
        }
        catch (err) {
            res.status(500).json({ error: 'Failed to get recipe.' });
        }
    },
    create: async (req, res, db) => {
        try {
            const newRecipe = req.body;
            const recipeId = await db.save(newRecipe);
            res.json({ id: recipeId });
        }
        catch (err) {
            res.status(500).json({ error: 'Failed to create recipe.' });
        }
    },
    update: async (req, res, db) => {
        try {
            const recipeId = req.params['recipeId'] ?? '';
            const newRecipe = req.body;
            newRecipe.id = recipeId;
            await db.save(newRecipe);
            res.json({ id: recipeId });
        }
        catch (err) {
            res.status(500).json({ error: 'Failed to update recipe.' });
        }
    },
    uploadImage: async (req, res, db) => {
        try {
            const recipeId = req.params['recipeId'] ?? '';
            const file = req.file;
            if (!file) {
                res.status(400).json({ error: 'No image file provided.' });
                return;
            }
            const recipe = await db.find(recipeId);
            if (!recipe) {
                res.status(404).json({ error: 'Recipe not found.' });
                return;
            }
            const imagesDir = path_1.default.join(__dirname, '../images');
            if (!fs_1.default.existsSync(imagesDir)) {
                fs_1.default.mkdirSync(imagesDir, { recursive: true });
            }
            const imagePath = path_1.default.join(imagesDir, `${recipeId}.jpg`);
            fs_1.default.writeFileSync(imagePath, file.buffer);
            const imageUrl = `/api/images/serve/recipes/${recipeId}.jpg`;
            recipe.imageUrl = imageUrl;
            await db.save(recipe);
            res.json({
                success: true,
                image: {
                    filename: `${recipeId}.jpg`,
                    path: imageUrl,
                    size: file.size,
                    mimetype: file.mimetype
                }
            });
        }
        catch (err) {
            console.error('Image upload error:', err);
            res.status(500).json({ error: 'Failed to upload image.' });
        }
    },
    fetchFromUrl: async (req, res) => {
        try {
            const { url } = req.body;
            if (!url) {
                res.status(400).json({ error: "Missing 'url' in request body." });
                return;
            }
            const recipe = await scraper.fetch(url);
            res.json(recipe);
        }
        catch (err) {
            res.status(500).json({
                error: 'Failed to fetch recipe from URL.',
                details: err.message,
            });
        }
    },
};
exports.default = recipesController;
//# sourceMappingURL=recipesController.js.map
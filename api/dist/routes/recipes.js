"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const recipesController_1 = __importDefault(require("../controllers/recipesController"));
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed'));
        }
    },
});
function default_1(database) {
    const db = database;
    const router = (0, express_1.Router)();
    router.get('/recipes', (req, res) => {
        recipesController_1.default.list(req, res, db);
    });
    router.get('/search', async (req, res) => {
        try {
            const query = req.query['query'];
            if (!query) {
                res.status(400).json({ error: 'Query parameter is required.' });
                return;
            }
            const results = await db.search(query);
            res.json(results);
        }
        catch (err) {
            res.status(500).json({ error: 'Failed to search recipes.' });
        }
    });
    router.get('/recipes/:recipeId', (req, res) => {
        recipesController_1.default.get(req, res, db);
    });
    router.post('/recipes', (req, res) => {
        recipesController_1.default.create(req, res, db);
    });
    router.post('/recipes/:recipeId', (req, res) => {
        recipesController_1.default.update(req, res, db);
    });
    router.post('/recipes/:recipeId/image', upload.single('image'), (req, res) => {
        recipesController_1.default.uploadImage(req, res, db);
    });
    router.post('/recipes/fetch', (req, res) => {
        recipesController_1.default.fetchFromUrl(req, res);
    });
    return router;
}
//# sourceMappingURL=recipes.js.map
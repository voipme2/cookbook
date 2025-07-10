"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
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
const router = (0, express_1.Router)();
router.post('/temp', upload.single('image'), (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            res.status(400).json({ error: 'No image file provided.' });
            return;
        }
        const tempImagesDir = path_1.default.join(__dirname, '../images/temp');
        if (!fs_1.default.existsSync(tempImagesDir)) {
            fs_1.default.mkdirSync(tempImagesDir, { recursive: true });
        }
        const tempFilename = `${(0, uuid_1.v4)()}.jpg`;
        const tempImagePath = path_1.default.join(tempImagesDir, tempFilename);
        fs_1.default.writeFileSync(tempImagePath, file.buffer);
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
    }
    catch (err) {
        console.error('Temp image upload error:', err);
        res.status(500).json({ error: 'Failed to upload temporary image.' });
    }
});
router.get('/serve/temp/:filename', (req, res) => {
    const filename = req.params['filename'] || '';
    const tempImagesDir = path_1.default.join(__dirname, '../images/temp');
    if (!fs_1.default.existsSync(tempImagesDir)) {
        fs_1.default.mkdirSync(tempImagesDir, { recursive: true });
    }
    const imagePath = path_1.default.join(tempImagesDir, filename);
    if (fs_1.default.existsSync(imagePath)) {
        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.sendFile(imagePath);
    }
    else {
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(404).send('Image not found');
    }
});
router.get('/serve/recipes/:filename', (req, res) => {
    const filename = req.params['filename'] || '';
    const imagesDir = path_1.default.join(__dirname, '../images');
    if (!fs_1.default.existsSync(imagesDir)) {
        fs_1.default.mkdirSync(imagesDir, { recursive: true });
    }
    const imagePath = path_1.default.join(imagesDir, filename);
    if (fs_1.default.existsSync(imagePath)) {
        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.sendFile(imagePath);
    }
    else {
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(404).send('Image not found');
    }
});
exports.default = router;
//# sourceMappingURL=imageRoutes.js.map
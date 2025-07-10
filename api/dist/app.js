"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookbookdb_1 = __importDefault(require("./data/cookbookdb"));
const recipes_1 = __importDefault(require("./routes/recipes"));
const imageRoutes_1 = __importDefault(require("./routes/imageRoutes"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((_req, res, next) => {
    res.header('Content-Type', 'application/json');
    next();
});
app.use('/api', (0, recipes_1.default)(cookbookdb_1.default));
app.use('/api/images', imageRoutes_1.default);
app.use((req, res, _next) => {
    console.error(`404 Not Found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ error: 'Not found' });
});
app.use((err, _req, res, _next) => {
    console.error('Global error handler:', err.stack || err);
    res.status(500).json({ error: 'Internal server error', details: err.message || err });
});
const PORT = process.env['PORT'] || 3001;
app.listen(PORT, () => {
});
exports.default = app;
//# sourceMappingURL=app.js.map
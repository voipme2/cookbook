"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookbookdb_1 = __importDefault(require("./data/cookbookdb"));
const recipes_1 = __importDefault(require("./routes/recipes"));
const imageRoutes_1 = __importDefault(require("./routes/imageRoutes"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((_req, res, next) => {
    res.header('Content-Type', 'application/json');
    next();
});
app.use('/api', (0, recipes_1.default)(cookbookdb_1.default));
app.use('/api/images', imageRoutes_1.default);
const PORT = 3000;
app.listen(PORT, () => {
    console.info(`cookbook is running on port ${PORT}`);
});
exports.default = app;
//# sourceMappingURL=app.js.map
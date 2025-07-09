"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveTempImageToRecipe = moveTempImageToRecipe;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function moveTempImageToRecipe(tempFilename, recipeId) {
    const tempPath = path_1.default.join(__dirname, '../images/temp', tempFilename);
    const destPath = path_1.default.join(__dirname, '../images', `${recipeId}.jpg`);
    if (fs_1.default.existsSync(tempPath)) {
        fs_1.default.renameSync(tempPath, destPath);
    }
}
//# sourceMappingURL=imageController.js.map
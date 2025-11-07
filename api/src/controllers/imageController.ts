import fs from 'fs';
import path from 'path';
import { IMAGES_DIR, TEMP_IMAGES_DIR } from '../config/paths';

// Moves a temp image to the recipe's permanent location
export function moveTempImageToRecipe(tempFilename: string, recipeId: string): void {
  const tempPath = path.join(TEMP_IMAGES_DIR, tempFilename);
  const destPath = path.join(IMAGES_DIR, `${recipeId}.jpg`);
  if (fs.existsSync(tempPath)) {
    fs.renameSync(tempPath, destPath);
  }
} 
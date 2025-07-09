import fs from 'fs';
import path from 'path';

// Moves a temp image to the recipe's permanent location
export function moveTempImageToRecipe(tempFilename: string, recipeId: string): void {
  const tempPath = path.join(__dirname, '../images/temp', tempFilename);
  const destPath = path.join(__dirname, '../images', `${recipeId}.jpg`);
  if (fs.existsSync(tempPath)) {
    fs.renameSync(tempPath, destPath);
  }
} 
const fs = require('fs');

const recipes = require('./backups/recipes.json');

fs.writeFileSync("recipes.txt", recipes.map(r => {
  let out = `${r.name}\n`;
  r.ingredients.forEach(ing => {
    out += `${ing.text}\n`;
  });
  r.steps.forEach(step => {
    out += `${step.text}\n`;
  });
  return out;
}).join("\n"))

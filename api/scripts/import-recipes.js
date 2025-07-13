const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const slugify = require('slugify');

// Database connection configuration
const pool = new Pool({
  user: process.env.PGUSER || 'cookbook',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'cookbook',
  password: process.env.PGPASSWORD || 'cookbook123',
  port: process.env.PGPORT || 5432,
});

// Function to convert time strings to minutes
function convertToMinutes(time) {
  if (typeof time === 'number') return time;
  if (!time) return 0;
  
  const regex = /(\d+\s*(?:hr|h))?(\d+\s*(?:min|m))?/;
  const match = regex.exec(time);
  if (!match) {
    return 0;
  }
  const hours = match[1] ? parseInt(match[1], 10) : 0;
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  return hours * 60 + minutes;
}

// Function to generate ID from recipe name
function getId(name) {
  return slugify(name, { lower: true });
}

// Function to process a recipe and prepare it for database insertion
function processRecipe(recipe) {
  // Ensure required fields exist
  if (!recipe.name || !recipe.author) {
    console.warn(`Skipping recipe with missing name or author: ${JSON.stringify(recipe)}`);
    return null;
  }

  // Convert time fields to minutes
  const processedRecipe = {
    ...recipe,
    prepTime: convertToMinutes(recipe.prepTime),
    cookTime: convertToMinutes(recipe.cookTime),
    inactiveTime: convertToMinutes(recipe.inactiveTime),
    // Ensure ingredients and steps are arrays
    ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
    steps: Array.isArray(recipe.steps) ? recipe.steps : [],
    // Add description if missing
    description: recipe.description || '',
  };

  // Remove the id field from the recipe JSON since we'll use the database ID
  delete processedRecipe.id;

  // Remove any undefined or null values
  Object.keys(processedRecipe).forEach(key => {
    if (processedRecipe[key] === undefined || processedRecipe[key] === null) {
      delete processedRecipe[key];
    }
  });

  return processedRecipe;
}

// Main import function
async function importRecipes() {
  const client = await pool.connect();
  
  try {
    console.log('Starting recipe import...');
    
    // Read the recipes file
    const recipesPath = path.join(__dirname, '../backups/newrecipes.json');
    const recipesData = fs.readFileSync(recipesPath, 'utf8');
    const recipes = JSON.parse(recipesData);
    
    console.log(`Found ${recipes.length} recipes to import`);
    
    let imported = 0;
    let skipped = 0;
    let errors = 0;
    
    // Process each recipe
    for (const recipe of recipes) {
      try {
        const processedRecipe = processRecipe(recipe);
        
        if (!processedRecipe) {
          skipped++;
          continue;
        }
        
        const id = getId(processedRecipe.name);
        
        // Insert or update the recipe
        await client.query(
          'INSERT INTO recipes (id, recipe) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET recipe = $2',
          [id, processedRecipe]
        );
        
        imported++;
        
        if (imported % 10 === 0) {
          console.log(`Imported ${imported} recipes...`);
        }
        
      } catch (error) {
        console.error(`Error importing recipe "${recipe.name}":`, error.message);
        errors++;
      }
    }
    
    console.log('\nImport completed!');
    console.log(`✅ Successfully imported: ${imported} recipes`);
    console.log(`⏭️  Skipped: ${skipped} recipes`);
    console.log(`❌ Errors: ${errors} recipes`);
    
  } catch (error) {
    console.error('Import failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the import if this script is executed directly
if (require.main === module) {
  importRecipes()
    .then(() => {
      console.log('Recipe import completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Recipe import failed:', error);
      process.exit(1);
    });
}

module.exports = { importRecipes }; 
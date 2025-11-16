import { Pool } from "pg";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get database config from environment
const pool = new Pool({
  user: process.env.PGUSER || "cookbook",
  host: process.env.PGHOST || "localhost",
  password: process.env.PGPASSWORD || "cookbook123",
  database: process.env.PGDATABASE || "cookbook",
  port: parseInt(process.env.PGPORT || "5432", 10),
});

interface Recipe {
  name: string;
  description?: string;
  servings?: string | number;
  prepTime?: string | number;
  cookTime?: string | number;
  inactiveTime?: string | number;
  ingredients?: any[];
  steps?: any[];
  [key: string]: any;
}

async function generateId(name: string): Promise<string> {
  // Generate slug-like ID from name
  let id = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  // Check if ID already exists, if so append number
  let finalId = id;
  let counter = 1;

  while (true) {
    const existing = await pool.query(
      "SELECT id FROM recipes WHERE id = $1",
      [finalId]
    );

    if (existing.rows.length === 0) {
      break;
    }

    finalId = `${id}-${counter}`;
    counter++;
  }

  return finalId;
}

async function normalizeRecipe(recipe: Recipe): Promise<any> {
  // Normalize ingredients - can be strings or objects with text property
  let ingredients: string[] = [];
  if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
    ingredients = recipe.ingredients.map((ing: any) => {
      if (typeof ing === "string") {
        return ing;
      } else if (ing.text) {
        return ing.text;
      } else if (ing.ingredient) {
        return ing.ingredient;
      }
      return JSON.stringify(ing);
    });
  }

  // Normalize steps - can be strings or objects
  let steps: string[] = [];
  if (recipe.steps && Array.isArray(recipe.steps)) {
    steps = recipe.steps.map((step: any) => {
      if (typeof step === "string") {
        return step;
      } else if (step.instruction) {
        return step.instruction;
      } else if (step.text) {
        return step.text;
      }
      return JSON.stringify(step);
    });
  }

  // Create normalized recipe object without the old id field
  // (the id will be set as the database column, not in JSONB)
  const { id: _oldId, ...recipeWithoutId } = recipe;
  
  return {
    name: recipe.name,
    description: recipe.description || null,
    servings: recipe.servings?.toString() || null,
    prepTime: recipe.prepTime?.toString() || null,
    cookTime: recipe.cookTime?.toString() || null,
    inactiveTime: recipe.inactiveTime?.toString() || null,
    difficulty: recipe.difficulty || null,
    ingredients,
    steps,
    source: recipe.source || null,
    notes: recipe.notes || null,
    image: recipe.image || recipe.imageUrl || null,
    author: recipe.author || null,
    ...recipeWithoutId, // Include any other fields (except id)
  };
}

async function importRecipes() {
  try {
    console.log("📖 Importing recipes from backup...\n");

    // Try to find backup file
    const possiblePaths = [
      path.join(__dirname, "../api/backups/recipes.json"),
      path.join(__dirname, "../api/backups/newrecipes.json"),
      path.resolve("api/backups/recipes.json"),
      resolve("api/backups/newrecipes.json"),
    ];

    let data: string | null = null;
    let usedPath = "";

    for (const backupPath of possiblePaths) {
      try {
        if (fs.existsSync(backupPath)) {
          data = fs.readFileSync(backupPath, "utf-8");
          usedPath = backupPath;
          console.log(`📂 Found backup at: ${usedPath}\n`);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!data) {
      console.error("❌ Could not find recipes backup file");
      console.error(
        "   Looked in: api/backups/recipes.json, api/backups/newrecipes.json"
      );
      process.exit(1);
    }

    const recipes: Recipe[] = JSON.parse(data);

    if (!Array.isArray(recipes)) {
      console.error("❌ Backup file is not a JSON array");
      process.exit(1);
    }

    console.log(`Found ${recipes.length} recipes in backup\n`);

    // Insert recipes into database
    let inserted = 0;
    let updated = 0;
    let failed = 0;

    for (const recipe of recipes) {
      try {
        if (!recipe.name || recipe.name.trim().length === 0) {
          failed++;
          continue;
        }

        const recipeId = await generateId(recipe.name);
        const normalizedRecipe = await normalizeRecipe(recipe);

        // Try to insert or update
        const result = await pool.query(
          `INSERT INTO recipes (id, recipe) 
           VALUES ($1, $2) 
           ON CONFLICT (id) DO UPDATE 
           SET recipe = $2 
           RETURNING id`,
          [recipeId, JSON.stringify(normalizedRecipe)]
        );

        if (result.rows.length > 0) {
          inserted++;
        } else {
          updated++;
        }

        if ((inserted + updated) % 50 === 0) {
          console.log(
            `  ✓ Processed ${inserted + updated} recipes...`
          );
        }
      } catch (err) {
        failed++;
        if (failed <= 3) {
          console.error(
            `  ✗ Failed to import recipe: ${recipe.name}`
          );
          console.error(`    Error: ${err}`);
        }
      }
    }

    console.log(`\n✅ Import complete!`);
    console.log(`  ✓ Inserted/Updated: ${inserted + updated}`);
    console.log(`  ✗ Failed: ${failed}`);
    console.log(`  Total in backup: ${recipes.length}\n`);

    // Verify
    const countResult = await pool.query("SELECT COUNT(*) FROM recipes");
    const totalCount = countResult.rows[0].count;
    console.log(`📊 Total recipes in database: ${totalCount}\n`);

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to import recipes:", error);
    await pool.end();
    process.exit(1);
  }
}

// Helper function
function resolve(p: string): string {
  return path.resolve(p);
}

// Run if called directly
if (process.argv[1] === __filename) {
  importRecipes();
}

export { importRecipes };


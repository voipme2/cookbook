import { Pool } from "pg";

/**
 * Normalize recipe fields in the database
 * Converts ingredients and steps from objects to strings
 */

const pool = new Pool({
  user: process.env.PGUSER || "cookbook",
  host: process.env.PGHOST || "localhost",
  password: process.env.PGPASSWORD || "cookbook123",
  database: process.env.PGDATABASE || "cookbook",
  port: parseInt(process.env.PGPORT || "5432", 10),
});

function normalizeIngredients(ingredients: any[]): string[] {
  if (!Array.isArray(ingredients)) {
    return [];
  }

  return ingredients.map((ing: any) => {
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

function normalizeSteps(steps: any[]): string[] {
  if (!Array.isArray(steps)) {
    return [];
  }

  return steps.map((step: any) => {
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

async function normalizeRecipeFields() {
  try {
    console.log("🔧 Normalizing recipe fields in database...\n");

    // Get all recipes
    const result = await pool.query("SELECT id, recipe FROM recipes");

    if (result.rows.length === 0) {
      console.log("✅ No recipes to normalize.\n");
      await pool.end();
      process.exit(0);
    }

    let updated = 0;

    for (const row of result.rows) {
      const { id, recipe } = row;
      let hasChanges = false;
      const updatedRecipe = { ...recipe };

      // Check and normalize ingredients
      if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
        const hasObjectIngredients = recipe.ingredients.some(
          (ing: any) => typeof ing === "object"
        );

        if (hasObjectIngredients) {
          updatedRecipe.ingredients = normalizeIngredients(recipe.ingredients);
          hasChanges = true;
        }
      }

      // Check and normalize steps
      if (recipe.steps && Array.isArray(recipe.steps)) {
        const hasObjectSteps = recipe.steps.some((step: any) =>
          typeof step === "object"
        );

        if (hasObjectSteps) {
          updatedRecipe.steps = normalizeSteps(recipe.steps);
          hasChanges = true;
        }
      }

      if (hasChanges) {
        await pool.query("UPDATE recipes SET recipe = $1 WHERE id = $2", [
          JSON.stringify(updatedRecipe),
          id,
        ]);

        console.log(`  ✓ Normalized ${id}`);
        updated++;
      }
    }

    console.log(`\n✅ Updated ${updated} recipes with normalized fields!\n`);

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to normalize recipe fields:", error);
    await pool.end();
    process.exit(1);
  }
}

// Run if called directly
const filename = process.argv[1];
if (filename.includes("normalize-recipe-fields")) {
  normalizeRecipeFields();
}

export { normalizeRecipeFields };


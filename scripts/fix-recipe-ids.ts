import { Pool } from "pg";

/**
 * Fix recipe IDs in the database
 * Removes the incorrect 'id' field from the JSONB recipe objects
 * and ensures they use the database row ID instead
 */

const pool = new Pool({
  user: process.env.PGUSER || "cookbook",
  host: process.env.PGHOST || "localhost",
  password: process.env.PGPASSWORD || "cookbook123",
  database: process.env.PGDATABASE || "cookbook",
  port: parseInt(process.env.PGPORT || "5432", 10),
});

async function fixRecipeIds() {
  try {
    console.log("🔧 Fixing recipe IDs in database...\n");

    // Get all recipes where the JSONB id field exists and doesn't match the row id
    const result = await pool.query(`
      SELECT id, recipe
      FROM recipes
      WHERE recipe->>'id' IS NOT NULL
      AND recipe->>'id' != id
      LIMIT 10
    `);

    if (result.rows.length === 0) {
      console.log("✅ No recipe IDs to fix. All recipes look good!\n");
      await pool.end();
      process.exit(0);
    }

    console.log(`Found ${result.rows.length} recipes with mismatched IDs:\n`);

    let fixed = 0;
    for (const row of result.rows) {
      const { id, recipe } = row;
      const jsonbId = recipe.id;

      // Remove the id field from the JSONB object
      const updatedRecipe = { ...recipe };
      delete updatedRecipe.id;

      await pool.query(
        "UPDATE recipes SET recipe = $1 WHERE id = $2",
        [JSON.stringify(updatedRecipe), id]
      );

      console.log(`  ✓ Fixed ${id}`);
      console.log(`    Old JSONB id: ${jsonbId} → Removed`);
      fixed++;
    }

    console.log(`\n✅ Fixed ${fixed} recipes!\n`);

    // Check if there are more to fix
    const checkResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM recipes
      WHERE recipe->>'id' IS NOT NULL
      AND recipe->>'id' != id
    `);

    const remainingCount = parseInt(checkResult.rows[0].count, 10);
    if (remainingCount > 0) {
      console.log(
        `⚠️  There are ${remainingCount} more recipes to fix. Run this script again.\n`
      );
    } else {
      console.log("🎉 All recipe IDs are now consistent!\n");
    }

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to fix recipe IDs:", error);
    await pool.end();
    process.exit(1);
  }
}

// Run if called directly
const filename = process.argv[1];
if (filename.includes("fix-recipe-ids")) {
  fixRecipeIds();
}

export { fixRecipeIds };


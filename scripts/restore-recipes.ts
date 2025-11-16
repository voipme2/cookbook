import { Pool } from "pg";
import * as fs from "fs";
import * as path from "path";

// Get database config from environment
const pool = new Pool({
  user: process.env.PGUSER || "cookbook",
  host: process.env.PGHOST || "localhost",
  password: process.env.PGPASSWORD || "cookbook123",
  database: process.env.PGDATABASE || "cookbook",
  port: parseInt(process.env.PGPORT || "5432", 10),
});

async function restoreRecipes() {
  try {
    console.log("📖 Restoring recipes from backup...\n");

    // Read backup file
    const backupPath = path.join(__dirname, "../api/backups/recipes.json");
    const data = fs.readFileSync(backupPath, "utf-8");
    const recipes = JSON.parse(data);

    console.log(`Found ${recipes.length} recipes in backup\n`);

    // Insert recipes into database
    let inserted = 0;
    let skipped = 0;

    for (const recipe of recipes) {
      try {
        // Check if recipe already exists
        const existing = await pool.query(
          'SELECT id FROM recipes WHERE recipe->>\'name\' = $1',
          [recipe.name]
        );

        if (existing.rows.length > 0) {
          skipped++;
          continue;
        }

        // Generate ID from name
        const id = (recipe.name || "recipe")
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "");

        // Insert recipe
        await pool.query(
          "INSERT INTO recipes (id, recipe) VALUES ($1, $2) ON CONFLICT DO NOTHING",
          [id, JSON.stringify(recipe)]
        );

        inserted++;

        if (inserted % 10 === 0) {
          console.log(`  ✓ Inserted ${inserted} recipes...`);
        }
      } catch (err) {
        console.error(`  ✗ Failed to insert recipe: ${recipe.name}`);
        console.error(`    Error: ${err}`);
      }
    }

    console.log(`\n✅ Done!`);
    console.log(`  Inserted: ${inserted}`);
    console.log(`  Skipped: ${skipped} (already exist)`);
    console.log(`  Total in backup: ${recipes.length}\n`);

    await pool.end();
  } catch (error) {
    console.error("❌ Failed to restore recipes:", error);
    await pool.end();
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  restoreRecipes();
}

export { restoreRecipes };


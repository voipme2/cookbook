#!/usr/bin/env tsx

import { pool } from "../app/lib/db";
import { getAllRecipes, getRecipeCount } from "../app/lib/queries/recipes";
import { getAllGroups } from "../app/lib/queries/groups";

async function testDatabase() {
  console.log("🔍 Testing database connection...\n");

  try {
    // Test raw connection
    console.log("1️⃣ Testing raw connection...");
    const client = await pool.connect();
    console.log("   ✅ Connected to PostgreSQL\n");
    client.release();

    // Test recipes table
    console.log("2️⃣ Testing recipes table...");
    const recipeCount = await getRecipeCount();
    console.log(`   ✅ Found ${recipeCount} recipes\n`);

    // Get sample recipes
    console.log("3️⃣ Fetching recipes...");
    const recipes = await getAllRecipes();
    if (recipes.length > 0) {
      console.log(`   ✅ Retrieved ${recipes.length} recipes`);
      console.log(`   📖 First recipe: "${recipes[0].name}"\n`);
    } else {
      console.log("   ⚠️  No recipes found (this might be OK if database is empty)\n");
    }

    // Test groups table
    console.log("4️⃣ Testing groups table...");
    const groups = await getAllGroups();
    console.log(
      `   ✅ Found ${groups.length} groups`
    );
    if (groups.length > 0) {
      console.log(`   📁 Sample groups: ${groups.map((g) => g.name).join(", ")}`);
    }
    console.log("");

    console.log("✨ All database tests passed!\n");
    console.log("Database status:");
    console.log(`  - Recipes: ${recipeCount}`);
    console.log(`  - Groups: ${groups.length}`);
    console.log(
      `  - Connection string: postgresql://<user>:***@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`
    );

    process.exit(0);
  } catch (error: any) {
    console.error("❌ Database test failed!\n");
    console.error("Error:", error.message);
    console.error("\nTroubleshooting:");
    console.error("  1. Check .env file has correct database credentials");
    console.error(`     PGHOST: ${process.env.PGHOST}`);
    console.error(`     PGPORT: ${process.env.PGPORT}`);
    console.error(`     PGDATABASE: ${process.env.PGDATABASE}`);
    console.error("  2. Verify PostgreSQL is running");
    console.error("  3. Check database exists and is accessible");
    console.error(
      "  4. For Docker: ensure database container is running (docker-compose up)"
    );
    process.exit(1);
  }
}

testDatabase();


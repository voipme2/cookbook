#!/usr/bin/env node

const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  user: process.env.PGUSER || 'cookbook',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'cookbook',
  password: process.env.PGPASSWORD || 'cookbook123',
});

async function findDuplicates() {
  const client = await pool.connect();
  try {
    console.log('🔍 Searching for duplicate recipes...\n');
    
    // Find recipes with the same name
    const result = await client.query(`
      SELECT 
        recipe->>'name' as name,
        COUNT(*) as count,
        ARRAY_AGG(id) as ids,
        ARRAY_AGG(recipe->>'imageUrl') as imageUrls
      FROM recipes 
      GROUP BY recipe->>'name' 
      HAVING COUNT(*) > 1
      ORDER BY recipe->>'name'
    `);

    if (result.rows.length === 0) {
      console.log('✅ No duplicate recipes found!');
      return;
    }

    console.log(`Found ${result.rows.length} recipe(s) with duplicates:\n`);

    result.rows.forEach((row, index) => {
      console.log(`${index + 1}. "${row.name}" (${row.count} copies)`);
      row.ids.forEach((id, i) => {
        const hasImage = row.imageurls[i] && row.imageurls[i] !== '';
        console.log(`   - ID: ${id} ${hasImage ? '(has image)' : '(no image)'}`);
      });
      console.log('');
    });

    return result.rows;
  } finally {
    client.release();
  }
}

async function removeDuplicate(recipeName, keepId) {
  const client = await pool.connect();
  try {
    console.log(`🗑️  Removing duplicate recipes for "${recipeName}"...`);
    
    // Get all IDs for this recipe
    const result = await client.query(`
      SELECT id, recipe->>'imageUrl' as imageUrl
      FROM recipes 
      WHERE recipe->>'name' = $1
      ORDER BY id
    `, [recipeName]);

    const duplicates = result.rows.filter(row => row.id !== keepId);
    
    for (const duplicate of duplicates) {
      console.log(`   Removing: ${duplicate.id}`);
      
      // Delete from database
      await client.query('DELETE FROM recipes WHERE id = $1', [duplicate.id]);
      
      // Remove image file if it exists
      if (duplicate.imageurl && duplicate.imageurl.includes('/recipes/')) {
        const fs = require('fs');
        const path = require('path');
        const imagePath = path.join(__dirname, '../src/images', `${duplicate.id}.jpg`);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log(`   Removed image: ${duplicate.id}.jpg`);
        }
      }
    }
    
    console.log(`✅ Removed ${duplicates.length} duplicate(s) for "${recipeName}"`);
  } finally {
    client.release();
  }
}

async function main() {
  try {
    const duplicates = await findDuplicates();
    
    if (!duplicates || duplicates.length === 0) {
      await pool.end();
      return;
    }

    console.log('To remove duplicates, run:');
    console.log('node cleanup-duplicates.js remove "Recipe Name" keepId');
    console.log('');
    console.log('Example:');
    console.log('node cleanup-duplicates.js remove "Chocolate Chip Cookies" chocolate-chip-cookies');
    console.log('');

    // If command line arguments are provided
    if (process.argv.length >= 5) {
      const command = process.argv[2];
      const recipeName = process.argv[3];
      const keepId = process.argv[4];

      if (command === 'remove') {
        await removeDuplicate(recipeName, keepId);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main();
}

module.exports = { findDuplicates, removeDuplicate }; 
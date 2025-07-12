#!/usr/bin/env node

const { Pool } = require('pg');
const readline = require('readline');

// Database configuration
const pool = new Pool({
  user: process.env.PGUSER || 'cookbook',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'cookbook',
  password: process.env.PGPASSWORD || 'cookbook123',
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function findDuplicates() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT 
        recipe->>'name' as name,
        COUNT(*) as count,
        ARRAY_AGG(id) as ids,
        ARRAY_AGG(recipe->>'imageUrl') as imageUrls,
        ARRAY_AGG(recipe->>'author') as authors,
        ARRAY_AGG(recipe->>'description') as descriptions
      FROM recipes 
      GROUP BY recipe->>'name' 
      HAVING COUNT(*) > 1
      ORDER BY recipe->>'name'
    `);
    return result.rows;
  } finally {
    client.release();
  }
}

async function getRecipeDetails(id) {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT recipe FROM recipes WHERE id = $1', [id]);
    return result.rows[0]?.recipe;
  } finally {
    client.release();
  }
}

async function removeDuplicate(recipeName, keepId) {
  const client = await pool.connect();
  try {
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
    console.log('🔍 Searching for duplicate recipes...\n');
    
    const duplicates = await findDuplicates();
    
    if (duplicates.length === 0) {
      console.log('✅ No duplicate recipes found!');
      rl.close();
      await pool.end();
      return;
    }

    console.log(`Found ${duplicates.length} recipe(s) with duplicates:\n`);

    for (const duplicate of duplicates) {
      console.log(`📝 "${duplicate.name}" (${duplicate.count} copies):`);
      
      // Show details for each duplicate
      for (let i = 0; i < duplicate.ids.length; i++) {
        const id = duplicate.ids[i];
        const hasImage = duplicate.imageurls[i] && duplicate.imageurls[i] !== '';
        const author = duplicate.authors[i] || 'Unknown';
        const description = duplicate.descriptions[i] || 'No description';
        
        console.log(`   ${i + 1}. ID: ${id}`);
        console.log(`      Author: ${author}`);
        console.log(`      Description: ${description.substring(0, 100)}${description.length > 100 ? '...' : ''}`);
        console.log(`      Image: ${hasImage ? '✅ Yes' : '❌ No'}`);
        console.log('');
      }

      // Ask which one to keep
      const answer = await question(`Which copy of "${duplicate.name}" would you like to keep? (1-${duplicate.ids.length}, or 'skip'): `);
      
      if (answer.toLowerCase() === 'skip') {
        console.log('⏭️  Skipping this recipe...\n');
        continue;
      }

      const choice = parseInt(answer) - 1;
      if (choice >= 0 && choice < duplicate.ids.length) {
        const keepId = duplicate.ids[choice];
        console.log(`✅ Keeping: ${keepId}`);
        
        const confirm = await question('Remove the other copies? (y/n): ');
        if (confirm.toLowerCase() === 'y' || confirm.toLowerCase() === 'yes') {
          await removeDuplicate(duplicate.name, keepId);
        } else {
          console.log('⏭️  Skipping removal...');
        }
      } else {
        console.log('❌ Invalid choice, skipping...');
      }
      
      console.log('');
    }

    console.log('🎉 Duplicate cleanup complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    rl.close();
    await pool.end();
  }
}

if (require.main === module) {
  main();
} 
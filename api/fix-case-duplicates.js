const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.PGUSER || 'cookbook',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'cookbook',
  password: process.env.PGPASSWORD || 'cookbook123',
});

async function fixCaseDuplicates() {
  const client = await pool.connect();
  try {
    console.log('Finding duplicate recipes with different case IDs...');
    
    // Find recipes with the same name but different IDs
    const result = await client.query(`
      SELECT 
        recipe->>'name' as name,
        array_agg(id) as ids,
        array_agg(recipe->>'imageUrl') as imageUrls,
        count(*) as count
      FROM recipes 
      GROUP BY recipe->>'name'
      HAVING count(*) > 1
    `);
    
    console.log('Found duplicate groups:', result.rows);
    
    for (const group of result.rows) {
      const { name, ids, imageurls, count } = group;
      console.log(`\nProcessing duplicates for "${name}":`);
      console.log('IDs:', ids);
      console.log('Image URLs:', imageurls);
      
      // Find which ID has an image and which doesn't
      const idWithImage = ids.find((id, index) => imageurls[index] && imageurls[index] !== 'null');
      const idWithoutImage = ids.find((id, index) => !imageurls[index] || imageurls[index] === 'null');
      
      if (idWithImage && idWithoutImage) {
        console.log(`Keeping ${idWithImage} (has image), deleting ${idWithoutImage} (no image)`);
        
        // Delete the recipe without image
        await client.query('DELETE FROM recipes WHERE id = $1', [idWithoutImage]);
        console.log(`Deleted recipe with ID: ${idWithoutImage}`);
        
        // If the kept ID is not lowercase, update it
        if (idWithImage !== idWithImage.toLowerCase()) {
          const newId = idWithImage.toLowerCase();
          console.log(`Updating ID from ${idWithImage} to ${newId}`);
          
          // Get the recipe data
          const recipeResult = await client.query('SELECT recipe FROM recipes WHERE id = $1', [idWithImage]);
          const recipe = recipeResult.rows[0].recipe;
          
          // Insert with new lowercase ID
          await client.query('INSERT INTO recipes (id, recipe) VALUES ($1, $2)', [newId, recipe]);
          
          // Delete the old ID
          await client.query('DELETE FROM recipes WHERE id = $1', [idWithImage]);
          
          console.log(`Updated recipe ID to lowercase: ${newId}`);
        }
      } else {
        console.log('Could not determine which to keep, skipping...');
      }
    }
    
    console.log('\nCase duplicate fix completed!');
  } catch (error) {
    console.error('Error fixing case duplicates:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

fixCaseDuplicates(); 
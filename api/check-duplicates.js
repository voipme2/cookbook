const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.PGUSER || 'cookbook',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'cookbook',
  password: process.env.PGPASSWORD || 'cookbook123',
});

async function checkDuplicates() {
  const client = await pool.connect();
  try {
    console.log('Checking for duplicate recipes...');
    
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
    
    if (result.rows.length === 0) {
      console.log('No duplicates found!');
    } else {
      for (const group of result.rows) {
        const { name, ids, imageUrls, count } = group;
        console.log(`\nDuplicate group for "${name}":`);
        console.log('IDs:', ids);
        console.log('Image URLs:', imageUrls);
        console.log('Count:', count);
      }
    }
  } catch (error) {
    console.error('Error checking duplicates:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkDuplicates(); 
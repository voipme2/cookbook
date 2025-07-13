const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'cookbook',
  password: process.env.PGPASSWORD || 'password',
});

async function testGroupSearch() {
  const client = await pool.connect();
  try {
    console.log('Testing group search functionality...\n');

    // First, let's see what groups exist
    console.log('1. Checking existing groups:');
    const groupsResult = await client.query('SELECT * FROM recipe_groups ORDER BY name');
    console.log('Groups found:', groupsResult.rows);
    console.log('');

    // Check what recipes are in groups
    console.log('2. Checking recipe-group relationships:');
    const membersResult = await client.query(`
      SELECT rgm.group_id, rgm.recipe_id, rg.name as group_name, r.recipe->>'name' as recipe_name
      FROM recipe_group_members rgm
      JOIN recipe_groups rg ON rg.id = rgm.group_id
      JOIN recipes r ON r.id = rgm.recipe_id
      ORDER BY rg.name, r.recipe->>'name'
    `);
    console.log('Recipe-group memberships:', membersResult.rows);
    console.log('');

    // Test the search query with 'bbq'
    console.log('3. Testing search query with "bbq":');
    const searchQuery = `
      SELECT r.id,
             r.recipe->>'name' AS name,
             r.recipe->>'description' AS description,
             r.recipe->>'options' AS options,
             r.recipe->>'imageUrl' AS "imageUrl",
             COALESCE(
               (
                 SELECT json_agg(json_build_object('id', g.id, 'name', g.name))
                 FROM recipe_group_members rgm
                 JOIN recipe_groups g ON g.id = rgm.group_id
                 WHERE rgm.recipe_id = r.id
               ), '[]'::json
             ) AS groups
      FROM recipes r
      WHERE r.recipe->>'name' ILIKE $1
         OR r.recipe->>'description' ILIKE $1
         OR EXISTS (
           SELECT 1
           FROM jsonb_array_elements_text(r.recipe->'ingredients') AS ingredient
           WHERE ingredient ILIKE $1
         )
         OR EXISTS (
           SELECT 1
           FROM jsonb_array_elements_text(r.recipe->'steps') AS step
           WHERE step ILIKE $1
         )
         OR EXISTS (
           SELECT 1
           FROM recipe_group_members rgm
           JOIN recipe_groups g ON g.id = rgm.group_id
           WHERE rgm.recipe_id = r.id
           AND g.name ILIKE $1
         )
      ORDER BY r.recipe->>'name' ASC
    `;
    
    const searchResult = await client.query(searchQuery, ['%bbq%']);
    console.log('Search results for "bbq":', searchResult.rows);
    console.log('');

    // Test with exact group name
    console.log('4. Testing with exact group name:');
    const exactGroupResult = await client.query(searchQuery, ['%BBQ%']);
    console.log('Search results for "BBQ":', exactGroupResult.rows);
    console.log('');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

testGroupSearch(); 
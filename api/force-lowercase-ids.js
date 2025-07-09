const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.PGUSER || 'cookbook',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'cookbook',
  password: process.env.PGPASSWORD || 'cookbook123',
});

async function forceLowercaseIds() {
  const client = await pool.connect();
  try {
    console.log('Fetching all recipes...');
    const result = await client.query('SELECT id, recipe FROM recipes');
    const recipes = result.rows;
    const seen = new Map();
    let changed = 0;

    for (const row of recipes) {
      const origId = row.id;
      const lowerId = origId.toLowerCase();
      if (origId !== lowerId) {
        // If a lowercase version already exists, decide which to keep
        if (seen.has(lowerId)) {
          // Merge: prefer the one with an image
          const existing = seen.get(lowerId);
          const keep = (row.recipe.imageUrl && row.recipe.imageUrl !== 'null') ? row : existing;
          const remove = (keep === row) ? existing : row;
          console.log(`Merging duplicate: keeping ${keep.id}, removing ${remove.id}`);
          // Update the kept record
          await client.query('UPDATE recipes SET recipe = $1 WHERE id = $2', [keep.recipe, lowerId]);
          // Delete the duplicate
          await client.query('DELETE FROM recipes WHERE id = $1', [remove.id]);
          changed++;
        } else {
          // Rename the ID to lowercase
          await client.query('INSERT INTO recipes (id, recipe) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET recipe = $2', [lowerId, row.recipe]);
          await client.query('DELETE FROM recipes WHERE id = $1', [origId]);
          seen.set(lowerId, { id: lowerId, recipe: row.recipe });
          changed++;
          console.log(`Renamed ${origId} -> ${lowerId}`);
        }
      } else {
        seen.set(lowerId, { id: lowerId, recipe: row.recipe });
      }
    }
    console.log(`\nLowercase ID enforcement complete. Changed: ${changed}`);
  } catch (error) {
    console.error('Error forcing lowercase IDs:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

forceLowercaseIds(); 
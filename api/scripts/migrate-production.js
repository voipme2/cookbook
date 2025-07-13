const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection configuration
const pool = new Pool({
  user: process.env.PGUSER || 'cookbook',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'cookbook',
  password: process.env.PGPASSWORD || 'cookbook123',
  port: process.env.PGPORT || 5432,
});

async function migrateProduction() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting production migration...\n');
    
    // Step 1: Create backup
    console.log('📦 Creating backup...');
    const backupRes = await client.query('SELECT id, recipe FROM recipes ORDER BY recipe->>\'name\'');
    const backupData = backupRes.rows;
    
    const backupPath = path.join(__dirname, `../backups/pre-migration-${Date.now()}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
    console.log(`✅ Backup created: ${backupPath}\n`);
    
    // Step 2: Show current state
    console.log('📊 Current recipe IDs:');
    const currentRes = await client.query(`
      SELECT id, recipe->>'name' AS name 
      FROM recipes 
      WHERE recipe->>'name' ILIKE '%pancake%' 
      ORDER BY recipe->>'name'
    `);
    
    currentRes.rows.forEach((recipe, index) => {
      console.log(`  ${index + 1}. "${recipe.name}" (ID: ${recipe.id})`);
    });
    console.log('');
    
    // Step 3: Run the migration
    console.log('🔄 Running migration...');
    const migrationSQL = fs.readFileSync(path.join(__dirname, 'migrate-recipe-ids.sql'), 'utf8');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          const result = await client.query(statement);
          if (result.rows && result.rows.length > 0) {
            console.log('Migration results:');
            result.rows.forEach(row => {
              console.log(`  ${row['Old ID']} → ${row['New ID']} (${row['Recipe Name']})`);
            });
          }
        } catch (error) {
          console.error(`Error executing statement: ${statement}`);
          throw error;
        }
      }
    }
    
    // Step 4: Verify the migration
    console.log('\n✅ Migration completed!');
    console.log('\n📊 New recipe IDs:');
    const newRes = await client.query(`
      SELECT id, recipe->>'name' AS name 
      FROM recipes 
      WHERE recipe->>'name' ILIKE '%pancake%' 
      ORDER BY recipe->>'name'
    `);
    
    newRes.rows.forEach((recipe, index) => {
      console.log(`  ${index + 1}. "${recipe.name}" (ID: ${recipe.id})`);
    });
    
    console.log('\n🎉 Migration successful!');
    console.log(`💾 Backup saved to: ${backupPath}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
migrateProduction()
  .then(() => {
    console.log('\n✅ Production migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Production migration failed:', error);
    process.exit(1);
  }); 
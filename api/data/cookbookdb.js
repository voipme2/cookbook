const {Pool} = require('pg');
const slugify = require('slugify');
const {duration} = require('moment');

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD
})

// pool.connect()
//   .then(client => {
//     client.query("CREATE TABLE recipes (id VARCHAR(255) PRIMARY KEY, recipe json NOT NULL)");
//   })

function convertToMinutes(timeStr) {
  return duration(timeStr).asMinutes();
}

function getId(name) {
  return slugify(name);
}

async function find(slug_id) {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT * from recipes where id = $1", [slug_id]);
    return res.rows[0].recipe;
  } finally {
    client.release();
  }
}

async function list() {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT id, recipe->>'name' AS name, recipe->>'description' AS description, recipe->>'options' AS options FROM recipes");
    return res.rows.map(r => ({ ...r, options: r.options ? JSON.parse(r.options) : {}}));
  } finally {
    client.release();
  }
}

async function save(recipe) {
  ['prepTime', 'inactiveTime', 'cookTime'].forEach(function (t) {
    if (recipe[t]) {
      recipe[t] = convertToMinutes(recipe[t]);
    }
  });

  // no need to save this
  if (recipe.totalTime) {
    delete recipe.totalTime;
  }

  const client = await pool.connect();
  try {
    const id = getId(recipe.name);
    await client.query("INSERT INTO recipes (id, recipe) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET recipe = $2", [id, recipe]);
    return id;
  } finally {
    client.release();
  }
}

async function remove(slug_id) {
  const client = await pool.connect();
  try {
    await client.query("DELETE FROM recipes WHERE id = $1", [slug_id]);
  } finally {
    client.release();
  }
}

async function search(query) {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT id, recipe->>'name' AS name FROM recipes WHERE recipe::text ILIKE $1", [`%${query}%`]);
    return res.rows;
  } finally {
    client.release();
  }
}

module.exports = {
  getId,
  search,
  find,
  remove,
  save,
  list
};

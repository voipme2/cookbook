const { Pool } = require("pg");
const slugify = require("slugify");
const fs = require("fs");

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
});

// only used for initial table creation
// pool.connect()
//   .then(client => {
//     client.query("CREATE TABLE recipes (id VARCHAR(255) PRIMARY KEY, recipe jsonb NOT NULL)");
//   })

// only used for initial index creation
// CREATE INDEX recipes_search_idx
// ON recipes USING GIN (
//   to_tsvector('english',
//     COALESCE(recipe->>'name', '') || ' ' ||
//     COALESCE(recipe->>'description', '') || ' ' ||
//     COALESCE(
//       jsonb_path_query_array(recipe->'ingredients', '$[*].text')::text, ''
//     ) || ' ' ||
//     COALESCE(
//       jsonb_path_query_array(recipe->'steps', '$[*].text')::text, ''
//     )
//   )
// );
// CREATE EXTENSION IF NOT EXISTS pg_trgm;

function getId(name) {
  return slugify(name);
}

const regex = /(\d+\s*(?:hr|h))?(\d+\s*(?:min|m))?/;

function convertToMinutes(time) {
  const match = regex.exec(time);
  if (!match) {
    return 0;
  }
  const hours = match[1] ? parseInt(match[1], 10) : 0;
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  return hours * 60 + minutes;
}

function convertToDuration(minutes) {
  const totalHours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  // if there are hours and no minutes, don't show the minutes. if there are minutes and no hours, show the minutes. if there are hours and minutes, show both
  return totalHours > 0 && remainingMinutes > 0
    ? `${totalHours} hr ${remainingMinutes} min`
    : totalHours > 0
      ? `${totalHours} hr`
      : `${remainingMinutes} min`;
}

async function find(slug_id) {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT * from recipes where id = $1", [
      slug_id,
    ]);
    const { recipe } = res.rows[0];
    // convert prepTime, inactiveTime, cookTime from minutes to a duration string
    ["prepTime", "inactiveTime", "cookTime"].forEach(function (t) {
      if (recipe[t]) {
        recipe[t] = convertToDuration(recipe[t]);
      }
    });
    return recipe;
  } finally {
    client.release();
  }
}

async function list() {
  const client = await pool.connect();
  try {
    const res = await client.query(
      "SELECT id, recipe->>'name' AS name, recipe->>'description' AS description, recipe->>'options' AS options FROM recipes ORDER BY recipe->>'name' ASC",
    );
    return res.rows.map((r) => ({
      ...r,
      options: r.options ? JSON.parse(r.options) : {},
    }));
  } finally {
    client.release();
  }
}

async function save(recipe) {
  ["prepTime", "inactiveTime", "cookTime"].forEach(function (t) {
    if (recipe[t]) {
      recipe[t] = convertToMinutes(recipe[t]);
    }
  });

  // no need to save this
  if (recipe.totalTime) {
    delete recipe.totalTime;
  }
  recipe.name = recipe.name.trim();

  const client = await pool.connect();
  try {
    const id = getId(recipe.name);
    await client.query(
      "INSERT INTO recipes (id, recipe) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET recipe = $2",
      [id, recipe],
    );
    return id;
  } finally {
    client.release();
  }
}

async function remove(slug_id) {
  const client = await pool.connect();
  try {
    await client.query("DELETE FROM recipes WHERE id = $1", [slug_id]);
    // remove the image from disk
    if (fs.existsSync(`./images/${slug_id}.jpg`)) {
      fs.unlinkSync(`./images/${slug_id}.jpg`);
    }
  } finally {
    client.release();
  }
}

async function search(query) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      "SELECT id, \n" +
        "       recipe->>'name' AS name, \n" +
        "       recipe->>'description' AS description, \n" +
        "       recipe->>'options' AS options, \n" +
        "       recipe->>'imageUrl' AS imageUrl \n" +
        "FROM recipes \n" +
        "WHERE recipe->>'name' ILIKE $1 \n" + // Search name
        "   OR recipe->>'description' ILIKE $1 \n" + // Search description
        "   OR EXISTS (\n" + // Search ingredients & steps using pg_trgm similarity
        "     SELECT 1\n" +
        "     FROM jsonb_array_elements_text(recipe->'ingredients') AS ingredient \n" +
        "     WHERE ingredient ILIKE $1\n" + // Case-insensitive match
        "   )\n" +
        "   OR EXISTS (\n" + // Search steps using pg_trgm similarity
        "     SELECT 1\n" +
        "     FROM jsonb_array_elements_text(recipe->'steps') AS step \n" +
        "     WHERE step ILIKE $1\n" + // Case-insensitive match
        "   );",
      [`%${query}%`], // Wrap the query in % for partial match
    );
    return res.rows;
  } finally {
    client.release();
  }
}

// given an image and a recipeId, save the image to disk and return the URL
async function saveImage(recipeId, image) {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT * FROM recipes WHERE id = $1", [
      recipeId,
    ]);
    const recipe = res.rows[0].recipe;
    const imageUrl = `/images/${recipeId}.jpg`;
    recipe.imageUrl = imageUrl;
    await client.query("UPDATE recipes SET recipe = $1 WHERE id = $2", [
      recipe,
      recipeId,
    ]);
    // write the image to disk
    fs.writeFileSync(`.${imageUrl}`, image, "base64");

    return imageUrl;
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
  list,
  saveImage,
};

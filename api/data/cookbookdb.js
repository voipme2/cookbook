const { Pool } = require("pg");
const slugify = require("slugify");
const fs = require("fs");
const path = require("path");
const { moveTempImageToRecipe } = require("../controllers/imageController");

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
});

const IMAGES_DIR = path.join(__dirname, "../images");
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

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
    // If the recipe has a temp image, move it to the permanent location
    if (recipe.imageUrl && recipe.imageUrl.includes("/temp/")) {
      // Extract the temp filename from the URL
      const match = recipe.imageUrl.match(/\/temp\/([^\/]+)$/);
      if (match && match[1]) {
        moveTempImageToRecipe(match[1], id);
        recipe.imageUrl = `/api/images/serve/recipes/${id}.jpg`;
      }
    }
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
    const imagePath = path.join(IMAGES_DIR, `${slug_id}.jpg`);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  } finally {
    client.release();
  }
}

async function search(query) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      // @formatter:off
      `
          SELECT id,
                 recipe ->>'name' AS name,
                 recipe->>'description' AS description,
                 recipe->>'options' AS options,
                 recipe->>'imageUrl' AS imageUrl
          FROM recipes
          WHERE recipe->>'name' ILIKE $1
             OR recipe->>'description' ILIKE $1
             OR EXISTS (
               SELECT 1
               FROM jsonb_array_elements_text(recipe->'ingredients') AS ingredient
               WHERE ingredient ILIKE $1
             )
             OR EXISTS (
               SELECT 1
               FROM jsonb_array_elements_text(recipe->'steps') AS step
               WHERE step ILIKE $1
             );
      `,
      [`%${query}%`], // Wrap the query in % for partial match
      // @formatter:on
    );
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
  list,
};


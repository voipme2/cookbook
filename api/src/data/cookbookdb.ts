import { Pool } from 'pg';
import slugify from 'slugify';
import fs from 'fs';
import path from 'path';
import { DatabaseInterface, Recipe, SearchRecipe } from '../types';
// SAFE TO IGNORE: No update needed for imageController import at this time.
// import { moveTempImageToRecipe } from '../controllers/imageController';
const { moveTempImageToRecipe } = require('../controllers/imageController');

const pool = new Pool({
  user: process.env['PGUSER'],
  host: process.env['PGHOST'],
  database: process.env['PGDATABASE'],
  password: process.env['PGPASSWORD'],
});

const IMAGES_DIR = path.join(__dirname, '../images');
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

function getId(name: string): string {
  return slugify(name, { lower: true });
}

const regex = /(\d+\s*(?:hr|h))?(\d+\s*(?:min|m))?/;

function convertToMinutes(time: string | number): number {
  if (typeof time === 'number') return time;
  const match = regex.exec(time);
  if (!match) {
    return 0;
  }
  const hours = match[1] ? parseInt(match[1], 10) : 0;
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  return hours * 60 + minutes;
}

function convertToDuration(minutes: number): string {
  const totalHours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return totalHours > 0 && remainingMinutes > 0
    ? `${totalHours} hr ${remainingMinutes} min`
    : totalHours > 0
    ? `${totalHours} hr`
    : `${remainingMinutes} min`;
}

async function find(slug_id: string): Promise<Recipe | null> {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT * from recipes where id = $1', [slug_id]);
    if (res.rows.length === 0) return null;
    const { recipe } = res.rows[0];
    (['prepTime', 'inactiveTime', 'cookTime'] as const).forEach(function (t) {
      if ((recipe as any)[t]) {
        (recipe as any)[t] = convertToDuration((recipe as any)[t]);
      }
    });
    return recipe;
  } finally {
    client.release();
  }
}

async function list(): Promise<SearchRecipe[]> {
  const client = await pool.connect();
  try {
    const res = await client.query(
      "SELECT id, recipe->>'name' AS name, recipe->>'description' AS description, recipe->>'options' AS options, recipe->>'imageUrl' AS \"imageUrl\" FROM recipes ORDER BY recipe->>'name' ASC",
    );
    const recipes = res.rows.map((r: any) => ({
      ...r,
      options: r.options ? JSON.parse(r.options) : {},
    }));
    return recipes;
  } finally {
    client.release();
  }
}

async function save(recipe: Recipe): Promise<string> {
  (['prepTime', 'inactiveTime', 'cookTime'] as const).forEach(function (t) {
    if ((recipe as any)[t]) {
      (recipe as any)[t] = convertToMinutes((recipe as any)[t]);
    }
  });
  if ((recipe as any).totalTime) {
    delete (recipe as any).totalTime;
  }
  recipe.name = recipe.name.trim();
  const client = await pool.connect();
  try {
    const id = getId(recipe.name);
    if (recipe.imageUrl && recipe.imageUrl.includes('/temp/')) {
      const match = recipe.imageUrl.match(/\/temp\/([^\/]+)$/);
      if (match && match[1]) {
        moveTempImageToRecipe(match[1], id);
        recipe.imageUrl = `/api/images/serve/recipes/${id}.jpg`;
      }
    }
    await client.query(
      'INSERT INTO recipes (id, recipe) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET recipe = $2',
      [id, recipe],
    );
    return id;
  } finally {
    client.release();
  }
}

async function remove(slug_id: string): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM recipes WHERE id = $1', [slug_id]);
    const imagePath = path.join(IMAGES_DIR, `${slug_id}.jpg`);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  } finally {
    client.release();
  }
}

async function search(query: string): Promise<SearchRecipe[]> {
  const client = await pool.connect();
  try {
    const res = await client.query(
      `
          SELECT id,
                 recipe ->>'name' AS name,
                 recipe->>'description' AS description,
                 recipe->>'options' AS options,
                 recipe->>'imageUrl' AS "imageUrl"
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
      [`%${query}%`],
    );
    return res.rows;
  } finally {
    client.release();
  }
}

async function searchWithFilters(filters: any): Promise<SearchRecipe[]> {
  const client = await pool.connect();
  try {
    let conditions = [];
    let params = [];
    let paramIndex = 1;

    // Text search
    if (filters.query && filters.query.trim()) {
      conditions.push(`(
        recipe->>'name' ILIKE $${paramIndex}
        OR recipe->>'description' ILIKE $${paramIndex}
        OR EXISTS (
          SELECT 1
          FROM jsonb_array_elements_text(recipe->'ingredients') AS ingredient
          WHERE ingredient ILIKE $${paramIndex}
        )
        OR EXISTS (
          SELECT 1
          FROM jsonb_array_elements_text(recipe->'steps') AS step
          WHERE step ILIKE $${paramIndex}
        )
      )`);
      params.push(`%${filters.query}%`);
      paramIndex++;
    }

    // Dietary filters
    if (filters.isVegetarian) {
      conditions.push(`recipe->'options'->>'isVegetarian' = 'true'`);
    }
    if (filters.isVegan) {
      conditions.push(`recipe->'options'->>'isVegan' = 'true'`);
    }
    if (filters.isDairyFree) {
      conditions.push(`recipe->'options'->>'isDairyFree' = 'true'`);
    }
    if (filters.isGlutenFree) {
      conditions.push(`recipe->'options'->>'isGlutenFree' = 'true'`);
    }
    if (filters.isCrockPot) {
      conditions.push(`recipe->'options'->>'isCrockPot' = 'true'`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT id,
             recipe->>'name' AS name,
             recipe->>'description' AS description,
             recipe->>'options' AS options,
             recipe->>'imageUrl' AS "imageUrl"
      FROM recipes
      ${whereClause}
      ORDER BY recipe->>'name' ASC
    `;

    const res = await client.query(query, params);
    return res.rows.map((r: any) => ({
      ...r,
      options: r.options ? JSON.parse(r.options) : {},
    }));
  } finally {
    client.release();
  }
}

// SAFE TO IGNORE: No image saving logic needed at this time.
async function saveImage(_recipeId: string, _image: string): Promise<void> {
  // TODO: Implement image saving logic
  return;
}

const cookbookdb: DatabaseInterface = {
  search,
  searchWithFilters,
  find,
  remove,
  save,
  list,
  saveImage,
};

export default cookbookdb; 
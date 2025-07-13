import { Pool } from 'pg';
import slugify from 'slugify';
import fs from 'fs';
import path from 'path';
import { DatabaseInterface, Recipe, SearchRecipe, RecipeGroup } from '../types';
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
  // Remove the id field from the recipe JSON since we'll use the database ID
  if ((recipe as any).id) {
    delete (recipe as any).id;
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

// Recipe Groups functions
async function createGroup(group: Omit<RecipeGroup, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const client = await pool.connect();
  try {
    const id = getId(group.name);
    await client.query(
      'INSERT INTO recipe_groups (id, name, description) VALUES ($1, $2, $3)',
      [id, group.name.trim(), group.description?.trim() || null]
    );
    return id;
  } finally {
    client.release();
  }
}

async function updateGroup(id: string, group: Partial<RecipeGroup>): Promise<void> {
  const client = await pool.connect();
  try {
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (group.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      params.push(group.name.trim());
    }
    if (group.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      params.push(group.description?.trim() || null);
    }

    if (updates.length === 0) return;

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);

    await client.query(
      `UPDATE recipe_groups SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
      params
    );
  } finally {
    client.release();
  }
}

async function deleteGroup(id: string): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM recipe_groups WHERE id = $1', [id]);
  } finally {
    client.release();
  }
}

async function getGroup(id: string): Promise<RecipeGroup | null> {
  const client = await pool.connect();
  try {
    const res = await client.query(
      `SELECT g.*, COUNT(rgm.recipe_id) as recipe_count 
       FROM recipe_groups g 
       LEFT JOIN recipe_group_members rgm ON g.id = rgm.group_id 
       WHERE g.id = $1 
       GROUP BY g.id`,
      [id]
    );
    
    if (res.rows.length === 0) return null;
    
    const row = res.rows[0];
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      recipeCount: parseInt(row.recipe_count)
    };
  } finally {
    client.release();
  }
}

async function listGroups(): Promise<RecipeGroup[]> {
  const client = await pool.connect();
  try {
    const res = await client.query(
      `SELECT g.*, COUNT(rgm.recipe_id) as recipe_count 
       FROM recipe_groups g 
       LEFT JOIN recipe_group_members rgm ON g.id = rgm.group_id 
       GROUP BY g.id 
       ORDER BY g.name ASC`
    );
    
    return res.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      recipeCount: parseInt(row.recipe_count)
    }));
  } finally {
    client.release();
  }
}

async function addRecipeToGroup(groupId: string, recipeId: string): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(
      'INSERT INTO recipe_group_members (group_id, recipe_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [groupId, recipeId]
    );
  } finally {
    client.release();
  }
}

async function removeRecipeFromGroup(groupId: string, recipeId: string): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(
      'DELETE FROM recipe_group_members WHERE group_id = $1 AND recipe_id = $2',
      [groupId, recipeId]
    );
  } finally {
    client.release();
  }
}

async function getGroupRecipes(groupId: string): Promise<SearchRecipe[]> {
  const client = await pool.connect();
  try {
    const res = await client.query(
      `SELECT r.id, 
              r.recipe->>'name' AS name, 
              r.recipe->>'description' AS description, 
              r.recipe->>'options' AS options, 
              r.recipe->>'imageUrl' AS "imageUrl"
       FROM recipes r
       INNER JOIN recipe_group_members rgm ON r.id = rgm.recipe_id
       WHERE rgm.group_id = $1
       ORDER BY r.recipe->>'name' ASC`,
      [groupId]
    );
    
    return res.rows.map((r: any) => ({
      ...r,
      options: r.options ? JSON.parse(r.options) : {},
    }));
  } finally {
    client.release();
  }
}

async function getRecipeGroups(recipeId: string): Promise<RecipeGroup[]> {
  const client = await pool.connect();
  try {
    const res = await client.query(
      `SELECT g.*, COUNT(rgm2.recipe_id) as recipe_count
       FROM recipe_groups g
       INNER JOIN recipe_group_members rgm ON g.id = rgm.group_id
       LEFT JOIN recipe_group_members rgm2 ON g.id = rgm2.group_id
       WHERE rgm.recipe_id = $1
       GROUP BY g.id
       ORDER BY g.name ASC`,
      [recipeId]
    );
    
    return res.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      recipeCount: parseInt(row.recipe_count)
    }));
  } finally {
    client.release();
  }
}

const cookbookdb: DatabaseInterface = {
  search,
  searchWithFilters,
  find,
  remove,
  save,
  list,
  saveImage,
  createGroup,
  updateGroup,
  deleteGroup,
  getGroup,
  listGroups,
  addRecipeToGroup,
  removeRecipeFromGroup,
  getGroupRecipes,
  getRecipeGroups,
};

export default cookbookdb; 
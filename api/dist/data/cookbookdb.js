"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const slugify_1 = __importDefault(require("slugify"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const { moveTempImageToRecipe } = require('../controllers/imageController');
const pool = new pg_1.Pool({
    user: process.env['PGUSER'],
    host: process.env['PGHOST'],
    database: process.env['PGDATABASE'],
    password: process.env['PGPASSWORD'],
});
const IMAGES_DIR = path_1.default.join(__dirname, '../images');
if (!fs_1.default.existsSync(IMAGES_DIR)) {
    fs_1.default.mkdirSync(IMAGES_DIR, { recursive: true });
}
function getId(name) {
    return (0, slugify_1.default)(name);
}
const regex = /(\d+\s*(?:hr|h))?(\d+\s*(?:min|m))?/;
function convertToMinutes(time) {
    if (typeof time === 'number')
        return time;
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
    return totalHours > 0 && remainingMinutes > 0
        ? `${totalHours} hr ${remainingMinutes} min`
        : totalHours > 0
            ? `${totalHours} hr`
            : `${remainingMinutes} min`;
}
async function find(slug_id) {
    const client = await pool.connect();
    try {
        const res = await client.query('SELECT * from recipes where id = $1', [slug_id]);
        if (res.rows.length === 0)
            return null;
        const { recipe } = res.rows[0];
        ['prepTime', 'inactiveTime', 'cookTime'].forEach(function (t) {
            if (recipe[t]) {
                recipe[t] = convertToDuration(recipe[t]);
            }
        });
        return recipe;
    }
    finally {
        client.release();
    }
}
async function list() {
    const client = await pool.connect();
    try {
        const res = await client.query("SELECT id, recipe->>'name' AS name, recipe->>'description' AS description, recipe->>'options' AS options FROM recipes ORDER BY recipe->>'name' ASC");
        return res.rows.map((r) => ({
            ...r,
            options: r.options ? JSON.parse(r.options) : {},
        }));
    }
    finally {
        client.release();
    }
}
async function save(recipe) {
    ['prepTime', 'inactiveTime', 'cookTime'].forEach(function (t) {
        if (recipe[t]) {
            recipe[t] = convertToMinutes(recipe[t]);
        }
    });
    if (recipe.totalTime) {
        delete recipe.totalTime;
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
        await client.query('INSERT INTO recipes (id, recipe) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET recipe = $2', [id, recipe]);
        return id;
    }
    finally {
        client.release();
    }
}
async function remove(slug_id) {
    const client = await pool.connect();
    try {
        await client.query('DELETE FROM recipes WHERE id = $1', [slug_id]);
        const imagePath = path_1.default.join(IMAGES_DIR, `${slug_id}.jpg`);
        if (fs_1.default.existsSync(imagePath)) {
            fs_1.default.unlinkSync(imagePath);
        }
    }
    finally {
        client.release();
    }
}
async function search(query) {
    const client = await pool.connect();
    try {
        const res = await client.query(`
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
      `, [`%${query}%`]);
        return res.rows;
    }
    finally {
        client.release();
    }
}
async function saveImage(_recipeId, _image) {
    return;
}
const cookbookdb = {
    search,
    find,
    remove,
    save,
    list,
    saveImage,
};
exports.default = cookbookdb;
//# sourceMappingURL=cookbookdb.js.map
import { db } from "~/lib/db";
import { recipes, recipeGroupMembers, recipeGroups } from "~/lib/db.schema";
import { eq, sql, ilike, or, inArray } from "drizzle-orm";
import type { Recipe } from "~/types";
import slugify from "slugify";

/**
 * Utility function to generate slug-like IDs from recipe names
 */
function getId(name: string): string {
  return slugify(name, { lower: true });
}

/**
 * Convert duration from minutes to human readable format
 * e.g., 90 -> "1 hr 30 min"
 */
function convertToDuration(minutes: number): string {
  if (!minutes || minutes === 0) return "";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0 && mins > 0) return `${hours} hr ${mins} min`;
  if (hours > 0) return `${hours} hr`;
  return `${mins} min`;
}

/**
 * Convert duration from human readable to minutes
 * e.g., "1 hr 30 min" -> 90
 */
function convertToMinutes(time: string | number): number {
  if (typeof time === "number") return time;
  if (!time) return 0;
  
  const regex = /(\d+)\s*(?:hr|h)|(\d+)\s*(?:min|m)/gi;
  let matches;
  let totalMinutes = 0;
  
  while ((matches = regex.exec(time)) !== null) {
    if (matches[1]) totalMinutes += parseInt(matches[1], 10) * 60;
    if (matches[2]) totalMinutes += parseInt(matches[2], 10);
  }
  
  return totalMinutes;
}

/**
 * Format recipe from database (JSONB) to Recipe type
 */
function formatRecipe(row: any): Recipe {
  const recipe = row.recipe || row;
  
  // Convert time fields from minutes back to duration strings
  if (recipe.prepTime && typeof recipe.prepTime === "number") {
    recipe.prepTime = convertToDuration(recipe.prepTime);
  }
  if (recipe.cookTime && typeof recipe.cookTime === "number") {
    recipe.cookTime = convertToDuration(recipe.cookTime);
  }
  if (recipe.inactiveTime && typeof recipe.inactiveTime === "number") {
    recipe.inactiveTime = convertToDuration(recipe.inactiveTime);
  }
  
  // Normalize ingredients - ensure they're strings, not objects
  let ingredients = recipe.ingredients || [];
  if (Array.isArray(ingredients)) {
    ingredients = ingredients.map((ing: any) => {
      if (typeof ing === "string") {
        return ing;
      } else if (ing.text) {
        return ing.text;
      } else if (ing.ingredient) {
        return ing.ingredient;
      }
      return JSON.stringify(ing);
    });
  }
  
  // Normalize steps - ensure they're strings, not objects
  let steps = recipe.steps || [];
  if (Array.isArray(steps)) {
    steps = steps.map((step: any) => {
      if (typeof step === "string") {
        return step;
      } else if (step.instruction) {
        return step.instruction;
      } else if (step.text) {
        return step.text;
      }
      return JSON.stringify(step);
    });
  }
  
  // Always use the database row's ID, not the one from JSONB
  // The database ID is the canonical ID (stored in recipes.id column)
  // If row has an id property, use it; otherwise fall back to recipe.id
  const id = row.id || recipe.id;
  
  // Explicitly construct the Recipe object to avoid spreading unknown properties
  const formattedRecipe: Recipe = {
    id,
    name: recipe.name,
    description: recipe.description,
    author: recipe.author,
    source: recipe.source,
    servings: recipe.servings,
    prepTime: recipe.prepTime,
    inactiveTime: recipe.inactiveTime,
    cookTime: recipe.cookTime,
    difficulty: recipe.difficulty,
    image: recipe.image,
    imageUrl: recipe.imageUrl,
    notes: recipe.notes,
    ingredients,
    steps,
    options: recipe.options,
  };
  
  return formattedRecipe;
}

/**
 * Get all recipes
 */
export async function getAllRecipes(): Promise<Recipe[]> {
  const results = await db
    .select()
    .from(recipes)
    .orderBy(sql`${recipes.recipe}->>'name' ASC`);

  return results.map((row) => formatRecipe(row));
}

/**
 * Get a single recipe by ID with its groups
 */
export async function getRecipeById(id: string): Promise<Recipe | null> {
  const results = await db
    .select()
    .from(recipes)
    .where(eq(recipes.id, id));

  if (results.length === 0) return null;

  const recipe = formatRecipe(results[0]) as any;

  // Get groups for this recipe
  const groupResults = await db
    .select({
      id: recipeGroups.id,
      name: recipeGroups.name,
    })
    .from(recipeGroupMembers)
    .innerJoin(recipeGroups, eq(recipeGroupMembers.groupId, recipeGroups.id))
    .where(eq(recipeGroupMembers.recipeId, id))
    .orderBy(recipeGroups.name);

  // Ensure groups are plain JavaScript objects (not Drizzle wrapped objects)
  recipe.groups = groupResults.map((g) => ({
    id: g.id,
    name: g.name,
  }));
  
  return recipe;
}

/**
 * Search recipes by name, description, or ingredients
 */
export async function searchRecipes(query: string): Promise<Recipe[]> {
  // Search in name or description fields
  const results = await db
    .select()
    .from(recipes)
    .where(
      or(
        sql`${recipes.recipe}->>'name' ILIKE ${'%' + query + '%'}`,
        sql`${recipes.recipe}->>'description' ILIKE ${'%' + query + '%'}`
      )
    )
    .orderBy(sql`${recipes.recipe}->>'name' ASC`);

  return results.map((row) => formatRecipe(row));
}

/**
 * Create a new recipe
 */
export async function createRecipe(
  recipeData: Omit<Recipe, "id">
): Promise<string> {
  const id = getId(recipeData.name);
  
  // Convert time fields to minutes for storage
  const recipe: any = {
    ...recipeData,
    prepTime: convertToMinutes(recipeData.prepTime || ""),
    cookTime: convertToMinutes(recipeData.cookTime || ""),
    inactiveTime: convertToMinutes(recipeData.inactiveTime || ""),
  };

  await db.insert(recipes).values({
    id,
    recipe,
  });

  return id;
}

/**
 * Update an existing recipe
 */
export async function updateRecipe(
  id: string,
  recipeData: Partial<Recipe>
): Promise<void> {
  // Get existing recipe first
  const existing = await db
    .select()
    .from(recipes)
    .where(eq(recipes.id, id));

  if (existing.length === 0) {
    throw new Error(`Recipe with id ${id} not found`);
  }

  const currentRecipe = existing[0].recipe as any;

  // Merge with new data
  const updated: any = {
    ...currentRecipe,
    ...recipeData,
  };

  // Convert time fields to minutes for storage
  if (updated.prepTime && typeof updated.prepTime === "string") {
    updated.prepTime = convertToMinutes(updated.prepTime);
  }
  if (updated.cookTime && typeof updated.cookTime === "string") {
    updated.cookTime = convertToMinutes(updated.cookTime);
  }
  if (updated.inactiveTime && typeof updated.inactiveTime === "string") {
    updated.inactiveTime = convertToMinutes(updated.inactiveTime);
  }

  await db
    .update(recipes)
    .set({ recipe: updated })
    .where(eq(recipes.id, id));
}

/**
 * Delete a recipe (and its group memberships)
 */
export async function deleteRecipe(id: string): Promise<void> {
  await db.delete(recipes).where(eq(recipes.id, id));
  // Group memberships are automatically deleted due to ON DELETE CASCADE
}

/**
 * Get recipes for a specific group
 */
export async function getRecipesByGroup(groupId: string): Promise<Recipe[]> {
  const results = await db
    .select({
      id: recipes.id,
      recipe: recipes.recipe,
    })
    .from(recipes)
    .innerJoin(
      recipeGroupMembers,
      eq(recipes.id, recipeGroupMembers.recipeId)
    )
    .where(eq(recipeGroupMembers.groupId, groupId))
    .orderBy(sql`${recipes.recipe}->>'name' ASC`);

  return results.map((row) => formatRecipe(row));
}

/**
 * Get recipe count
 */
export async function getRecipeCount(): Promise<number> {
  const result = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(recipes);

  return result[0]?.count || 0;
}

/**
 * Check if recipe exists
 */
export async function recipeExists(id: string): Promise<boolean> {
  const result = await db
    .select({ id: recipes.id })
    .from(recipes)
    .where(eq(recipes.id, id))
    .limit(1);

  return result.length > 0;
}


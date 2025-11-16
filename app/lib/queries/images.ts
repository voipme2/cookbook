import { db } from "~/lib/db";
import { recipes } from "~/lib/db.schema";
import { eq, sql } from "drizzle-orm";

/**
 * Update recipe image URL
 */
export async function updateRecipeImage(
  recipeId: string,
  imageUrl: string
): Promise<void> {
  // Get existing recipe
  const existing = await db
    .select()
    .from(recipes)
    .where(eq(recipes.id, recipeId));

  if (existing.length === 0) {
    throw new Error(`Recipe with id ${recipeId} not found`);
  }

  const recipe = existing[0].recipe as any;

  // Update the imageUrl in the JSONB
  const updated = { ...recipe, imageUrl };

  await db
    .update(recipes)
    .set({ recipe: updated })
    .where(eq(recipes.id, recipeId));
}

/**
 * Get recipe image URL
 */
export async function getRecipeImageUrl(
  recipeId: string
): Promise<string | null> {
  const result = await db
    .select()
    .from(recipes)
    .where(eq(recipes.id, recipeId));

  if (result.length === 0) return null;

  const recipe = result[0].recipe as any;
  return recipe?.imageUrl || null;
}

/**
 * Remove recipe image
 */
export async function removeRecipeImage(recipeId: string): Promise<void> {
  // Get existing recipe
  const existing = await db
    .select()
    .from(recipes)
    .where(eq(recipes.id, recipeId));

  if (existing.length === 0) {
    throw new Error(`Recipe with id ${recipeId} not found`);
  }

  const recipe = existing[0].recipe as any;

  // Remove imageUrl from JSONB
  const recipeWithoutImage = { ...recipe };
  delete recipeWithoutImage.imageUrl;

  await db
    .update(recipes)
    .set({ recipe: recipeWithoutImage })
    .where(eq(recipes.id, recipeId));
}

/**
 * Get all recipes with images
 */
export async function getRecipesWithImages(): Promise<
  Array<{ id: string; imageUrl: string }>
> {
  const results = await db
    .select({
      id: recipes.id,
      imageUrl: sql<string>`${recipes.recipe}->>'imageUrl'`,
    })
    .from(recipes)
    .where(sql`${recipes.recipe}->>'imageUrl' IS NOT NULL`);

  return results;
}


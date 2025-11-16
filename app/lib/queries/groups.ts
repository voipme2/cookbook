import { db } from "~/lib/db";
import { recipeGroups, recipeGroupMembers, recipes } from "~/lib/db.schema";
import { eq, sql } from "drizzle-orm";
import type { Group } from "~/types";
import slugify from "slugify";

/**
 * Utility function to generate slug-like IDs from group names
 */
function getId(name: string): string {
  return slugify(name, { lower: true });
}

/**
 * Get all groups
 */
export async function getAllGroups(): Promise<Group[]> {
  const results = await db
    .select()
    .from(recipeGroups)
    .orderBy(recipeGroups.name);

  return results.map((row): Group => ({
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }));
}

/**
 * Get a single group by ID
 */
export async function getGroupById(id: string): Promise<Group | null> {
  const results = await db
    .select()
    .from(recipeGroups)
    .where(eq(recipeGroups.id, id));

  if (results.length === 0) return null;

  const row = results[0];
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/**
 * Create a new group
 */
export async function createGroup(
  data: Omit<Group, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const id = getId(data.name);

  await db.insert(recipeGroups).values({
    id,
    name: data.name.trim(),
    description: data.description?.trim() || null,
  });

  return id;
}

/**
 * Update a group
 */
export async function updateGroup(
  id: string,
  data: Partial<Omit<Group, "id" | "createdAt" | "updatedAt">>
): Promise<void> {
  const updates: Record<string, any> = {};

  if (data.name !== undefined) {
    updates.name = data.name.trim();
  }
  if (data.description !== undefined) {
    updates.description = data.description?.trim() || null;
  }

  if (Object.keys(updates).length === 0) {
    return;
  }

  await db
    .update(recipeGroups)
    .set(updates)
    .where(eq(recipeGroups.id, id));
}

/**
 * Delete a group (and its memberships)
 */
export async function deleteGroup(id: string): Promise<void> {
  await db.delete(recipeGroups).where(eq(recipeGroups.id, id));
  // Memberships are automatically deleted due to ON DELETE CASCADE
}

/**
 * Add a recipe to a group
 */
export async function addRecipeToGroup(
  groupId: string,
  recipeId: string
): Promise<void> {
  await db
    .insert(recipeGroupMembers)
    .values({
      groupId,
      recipeId,
    })
    .onConflictDoNothing();
}

/**
 * Remove a recipe from a group
 */
export async function removeRecipeFromGroup(
  groupId: string,
  recipeId: string
): Promise<void> {
  await db
    .delete(recipeGroupMembers)
    .where(
      sql`${recipeGroupMembers.groupId} = ${groupId} AND ${recipeGroupMembers.recipeId} = ${recipeId}`
    );
}

/**
 * Get all groups for a recipe
 */
export async function getGroupsForRecipe(recipeId: string): Promise<Group[]> {
  const results = await db
    .select({
      id: recipeGroups.id,
      name: recipeGroups.name,
      description: recipeGroups.description,
      createdAt: recipeGroups.createdAt,
      updatedAt: recipeGroups.updatedAt,
    })
    .from(recipeGroupMembers)
    .innerJoin(
      recipeGroups,
      eq(recipeGroupMembers.groupId, recipeGroups.id)
    )
    .where(eq(recipeGroupMembers.recipeId, recipeId))
    .orderBy(recipeGroups.name);

  return results.map((row): Group => ({
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }));
}

/**
 * Get recipe count for a group
 */
export async function getGroupRecipeCount(groupId: string): Promise<number> {
  const result = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(recipeGroupMembers)
    .where(eq(recipeGroupMembers.groupId, groupId));

  return result[0]?.count || 0;
}

/**
 * Check if group exists
 */
export async function groupExists(id: string): Promise<boolean> {
  const result = await db
    .select({ id: recipeGroups.id })
    .from(recipeGroups)
    .where(eq(recipeGroups.id, id))
    .limit(1);

  return result.length > 0;
}


import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/**
 * Recipes table - stores recipes as JSONB (matches existing schema)
 * The recipe column contains the full recipe object with nested ingredients/steps
 */
export const recipes = pgTable(
  "recipes",
  {
    id: varchar("id").primaryKey(), // slug-like ID (e.g., "chocolate-cake")
    recipe: jsonb("recipe").notNull(), // Full recipe object as JSONB
  },
  (table) => ({
    nameIdx: index("idx_recipes_name").using("gin", sql`${table.recipe}->>'name'`),
    descriptionIdx: index("idx_recipes_description").using("gin", sql`${table.recipe}->>'description'`),
  })
);

/**
 * Recipe Groups table
 */
export const recipeGroups = pgTable(
  "recipe_groups",
  {
    id: varchar("id").primaryKey(), // slug-like ID
    name: varchar("name").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .$onUpdate(() => new Date()),
  }
);

/**
 * Recipe Group Members table - many-to-many relationship
 */
export const recipeGroupMembers = pgTable(
  "recipe_group_members",
  {
    groupId: varchar("group_id")
      .notNull()
      .references(() => recipeGroups.id, { onDelete: "cascade" }),
    recipeId: varchar("recipe_id")
      .notNull()
      .references(() => recipes.id, { onDelete: "cascade" }),
    addedAt: timestamp("added_at", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    pk: primaryKey(table.groupId, table.recipeId),
    groupIdx: index("idx_recipe_group_members_group_id").on(table.groupId),
    recipeIdx: index("idx_recipe_group_members_recipe_id").on(table.recipeId),
  })
);


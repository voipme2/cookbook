/**
 * Shopping list generation utilities
 * Aggregates ingredients from multiple recipes into a shopping list
 */

import type { Recipe } from "~/types";
import { parseIngredient, itemsMatch } from "./ingredient-parser";

// Re-export commonly used types and functions for backwards compatibility
export type { ParsedIngredient } from "./ingredient-parser";
export { parseIngredient } from "./ingredient-parser";
export { convertToCanonical } from "./units";

/**
 * Represents a shopping list item
 * Shows the ingredient and all the ways it's used across recipes
 */
export interface ShoppingListItem {
  item: string;
  entries: Array<{
    recipe: string;
    quantity?: number;
    unit?: string;
    original: string;
    ingredient: string;
  }>;
}

/**
 * Generate a shopping list from recipes in a group
 */
export function generateShoppingList(recipes: Recipe[]): ShoppingListItem[] {
  const itemMap = new Map<string, ShoppingListItem>();

  for (const recipe of recipes) {
    if (!recipe.ingredients || !Array.isArray(recipe.ingredients)) {
      continue;
    }

    for (const ingredientStr of recipe.ingredients) {
      if (!ingredientStr || typeof ingredientStr !== "string") {
        continue;
      }

      const parsed = parseIngredient(ingredientStr);

      // Find or create item in map
      let existingItem: ShoppingListItem | undefined;
      for (const [, item] of itemMap) {
        if (itemsMatch(item.item, parsed.item)) {
          existingItem = item;
          break;
        }
      }

      const itemKey = parsed.item.toLowerCase().replace(/\s+/g, "_");

      if (!existingItem) {
        existingItem = {
          item: parsed.item,
          entries: [],
        };
        itemMap.set(itemKey, existingItem);
      }

      // Add entry to item
      existingItem.entries.push({
        recipe: recipe.name,
        quantity: parsed.quantity,
        unit: parsed.unit,
        original: parsed.original,
        ingredient: ingredientStr,
      });
    }
  }

  // Sort by item name and return as array
  return Array.from(itemMap.values()).sort((a, b) =>
    a.item.localeCompare(b.item)
  );
}

/**
 * Format a shopping list item for display
 */
export function formatShoppingListItem(item: ShoppingListItem): string {
  return item.item;
}

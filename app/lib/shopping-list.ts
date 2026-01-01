import type { Recipe } from "~/types";

/**
 * Represents a parsed ingredient with quantity and unit
 */
export interface ParsedIngredient {
  original: string;
  item: string;
  quantity?: number;
  unit?: string;
  rawQuantity?: string; // The original quantity string before parsing
}

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
    ingredient: string; // The original ingredient text before parsing
  }>;
}

/**
 * Common cooking units and their abbreviations
 */
const UNITS = [
  // Volume
  "cup", "cups", "c.", "c", // Add c. and c as cup abbreviations
  "tbsp", "tablespoon", "tablespoons", "tbs", "t",
  "tsp", "teaspoon", "teaspoons",
  "fl oz", "fl. oz", "fluid ounce", "fluid ounces",
  "ml", "milliliter", "milliliters",
  "l", "liter", "liters",
  "gal", "gallon", "gallons",
  "pt", "pint", "pints",
  "qt", "quart", "quarts",
  
  // Weight
  "g", "gram", "grams",
  "kg", "kilogram", "kilograms",
  "oz", "ounce", "ounces",
  "lb", "lbs", "pound", "pounds",
  "mg", "milligram", "milligrams",
  
  // Count
  "piece", "pieces",
  "clove", "cloves",
  "bulb", "bulbs",
  "head", "heads",
  "stalk", "stalks",
  "sprig", "sprigs",
  "pinch", "pinches",
  "dash", "dashes",
  "handful", "handfuls",
  "slice", "slices",
  "chunk", "chunks",
  "can", "cans",
  "jar", "jars",
  "package", "packages", "packet", "packets", // Add packet/packets
  "box", "boxes",
  "bunch", "bunches",
  "bottle", "bottles",
  "loaf", "loaves",
];

// Build regex that handles units with optional leading hyphen (e.g., "-ounce")
// Also handle units with trailing period (e.g., "c.")
const UNIT_REGEX = new RegExp(`^(?:-)?(${UNITS.map(u => u.replace(/\./g, "\\.?")).join("|")})(?:\\.|\\s|$)`, "i");

/**
 * Parse a single ingredient string
 * 
 * Strategy: Parse in stages from most specific to least specific
 * 1. Extract and remove quantity (handles ranges, fractions, decimals)
 * 2. Extract and remove unit (uses predefined unit list)
 * 3. Remove preparation methods and descriptors
 * 4. Clean up and normalize what remains
 * 
 * Examples:
 *   "2 cloves garlic, minced" -> { item: "garlic", quantity: 2, unit: "cloves" }
 *   "1/2 to 3/4 cup flour" -> { item: "flour", quantity: 0.625 (avg), unit: "cup" }
 *   "pinch of salt" -> { item: "salt", quantity: undefined, unit: "pinch" }
 *   "fresh basil" -> { item: "basil", quantity: undefined, unit: undefined }
 */
export function parseIngredient(ingredientString: string): ParsedIngredient {
  const original = ingredientString.trim();
  let remaining = original;

  // Stage 1: Remove leading range indicators and words
  // This handles: "-1 cup", "- 1 cup", "to 3/4 cup", "about 2 tbsp", "or 1 piece"
  remaining = remaining
    .replace(/^[\s\-–]+/i, "") // Remove leading spaces/dashes
    .replace(/^(to|or|about|approximately|roughly|around)\s+/i, "") // Remove range indicators
    .trim();

  // Stage 2: Extract quantity
  // Handles: "1", "1.5", "1 1/2", "1-2", "1⁄2" (unicode fraction), "1 to 2", "1-3"
  // Priority: mixed numbers (1 1/2) > ranges (1-2, 1 to 2) > simple numbers/fractions
  // First try to match mixed numbers like "1 1/2" or "2 3/4"
  const mixedNumberRegex = /^(\d+)\s+(\d+)\/(\d+)\s+/;
  const mixedNumberMatch = remaining.match(mixedNumberRegex);
  
  let quantity: number | undefined;
  let rawQuantity: string | undefined;
  let unit: string | undefined;
  
  if (mixedNumberMatch) {
    // Handle mixed number like "1 1/2"
    const whole = parseInt(mixedNumberMatch[1], 10);
    const numerator = parseInt(mixedNumberMatch[2], 10);
    const denominator = parseInt(mixedNumberMatch[3], 10);
    quantity = whole + (numerator / denominator);
    rawQuantity = `${whole} ${numerator}/${denominator}`;
    remaining = remaining.substring(mixedNumberMatch[0].length).trim();
  } else {
    // Try to match other quantity patterns (ranges, simple numbers, fractions)
    // Updated regex to better handle "X to Y" format (e.g., "1/2 to 3/4")
    const quantityRegex = /^([\d\/⁄\-\.½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]+(?:\s+(?:to|and|or|[-–])\s+[\d\/⁄\-\.½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]+)?)(?:\s+|$)/;
    const quantityMatch = remaining.match(quantityRegex);
    
    if (quantityMatch) {
      rawQuantity = quantityMatch[1].trim();
      remaining = remaining.substring(quantityMatch[0].length).trim();
      // Normalize unicode fractions to regular fractions for parsing
      quantity = parseQuantity(rawQuantity.replace(/⁄/g, "/"));
    }
  }

  // Stage 3: Extract unit (case-insensitive, including abbreviations like "tsp." or "c.") 
  // This happens after quantity extraction, whether it was a mixed number or regular quantity
  // Also handles cases like "pinch of salt" where there's a unit but no quantity
  // Handles units with leading hyphen like "-ounce"
  const unitMatch = remaining.match(UNIT_REGEX);
  if (unitMatch) {
    let matchedUnit = unitMatch[1].toLowerCase();
    // Normalize units to their canonical form using UNIT_MAP
    const unitInfo = UNIT_MAP[matchedUnit];
    if (unitInfo) {
      unit = unitInfo.canonical;
    } else {
      // Fallback for units not in map (shouldn't happen, but just in case)
      unit = matchedUnit;
    }
    remaining = remaining.substring(unitMatch[0].length).trim();
  }

  // Stage 4: Handle "of" connector (e.g., "pinch of salt", "clove of garlic")
  // This is important because units like "pinch" and "clove" are often followed by "of"
  remaining = remaining.replace(/^of\s+/i, "");

  // Stage 5: Remove packaging words that describe the container, not the ingredient
  // e.g., "packet active dry yeast" -> "active dry yeast"
  remaining = remaining.replace(/^(packet|packets|package|packages|can|cans|jar|jars|box|boxes|bottle|bottles)\s+/i, "");

  // Stage 6: Remove trailing descriptors and preparation methods
  // Handle multiple prep methods connected with "and" like "peeled and thinly sliced"
  let item = remaining
    // Remove trailing prep methods and descriptors after comma (handles "and" connections)
    // Updated to handle "peeled and thinly sliced" - matches adverbs like "thinly" followed by verbs
    .replace(/,?\s+((?:diced|chopped|minced|sliced|grated|shredded|crushed|whole|fresh|dried|melted|softened|peeled|cooked|raw|ground|divided|packed|loosely packed|tightly packed|to taste|roughly|finely|coarsely|thinly|thickly)(?:\s+and\s+(?:(?:roughly|finely|coarsely|thinly|thickly)\s+)?(?:diced|chopped|minced|sliced|grated|shredded|crushed|whole|fresh|dried|melted|softened|peeled|cooked|raw|ground|divided|packed|loosely packed|tightly packed|to taste))*)[\s,]*$/i, "")
    // Remove "plus more for X" or "reserved for X" phrases
    .replace(/,?\s*(?:plus|reserved)\s+more\s+for\s+\w+.*$/i, "")
    // Remove leading descriptors only if there's a quantity or unit (preserve when no quantity/unit)
    // This handles the case where "fresh basil" should remain "fresh basil" when there's no quantity/unit
    .replace(/^(fresh|dried|ground|chopped|diced|minced|raw|cooked|roughly|finely|coarsely)\s+/i, (match, descriptor) => {
      // Only remove leading descriptors if we have a quantity or unit
      if (quantity !== undefined || unit !== undefined) {
        return "";
      }
      return match; // Keep the descriptor if no quantity/unit
    })
    // Remove parenthetical notes like "(minced)" or "(about 2 cups)" or "(such as fresh)"
    .replace(/\s*\([^)]*\)\s*/g, " ")
    // Clean up excessive whitespace
    .replace(/\s+/g, " ")
    .trim();

  // Stage 7: Remove common generic count terms that describe packaging, not the ingredient
  // e.g., "garlic cloves" -> "garlic", "onion pieces" -> "onion", but keep "cherry tomatoes" as is
  item = item
    .replace(/\s+(cloves?|pieces?|chunks?|slices?|stalks?|sprigs?|bulbs?|heads?|bunches?|handfuls?|leaves?)$/i, "")
    .toLowerCase()
    .trim();

  // Final fallback
  if (!item) {
    item = remaining.toLowerCase().trim();
  }

  return {
    original,
    item,
    quantity,
    unit,
    rawQuantity,
  };
}

/**
 * Convert quantity strings to numbers
 * Examples:
 *   "2" -> 2
 *   "1.5" -> 1.5
 *   "1/2" -> 0.5
 *   "1 1/2" -> 1.5
 *   "2-3" -> 2.5 (average)
 */
function parseQuantity(quantityStr: string): number | undefined {
  const str = quantityStr.trim().toLowerCase();
  if (!str) return undefined;

  // Handle ranges with "to" like "1/2 to 3/4"
  const toRangeMatch = str.match(/^([\d.\/\s]+)\s+to\s+([\d.\/\s]+)$/);
  if (toRangeMatch) {
    const num1 = parseSingleQuantity(toRangeMatch[1].trim());
    const num2 = parseSingleQuantity(toRangeMatch[2].trim());
    if (num1 !== undefined && num2 !== undefined) {
      return (num1 + num2) / 2;
    }
  }

  // Handle ranges like "2-3"
  const rangeMatch = str.match(/^([\d.\/\s]+)\s*[-–]\s*([\d.\/\s]+)$/);
  if (rangeMatch) {
    const num1 = parseSingleQuantity(rangeMatch[1].trim());
    const num2 = parseSingleQuantity(rangeMatch[2].trim());
    if (num1 !== undefined && num2 !== undefined) {
      return (num1 + num2) / 2;
    }
  }

  // Handle "X and Y" like "1 and 1/2"
  const andMatch = str.match(/^([\d.\/]+)\s+and\s+([\d.\/]+)/);
  if (andMatch) {
    const num1 = parseSingleQuantity(andMatch[1].trim());
    const num2 = parseSingleQuantity(andMatch[2].trim());
    if (num1 !== undefined && num2 !== undefined) {
      return num1 + num2;
    }
  }

  return parseSingleQuantity(str);
}

/**
 * Parse a single quantity (number or fraction)
 */
function parseSingleQuantity(quantityStr: string): number | undefined {
  const str = quantityStr.trim();

  // Try fraction
  const fractionMatch = str.match(/^(\d+)?[\s\/]?(\d+)\/(\d+)$/);
  if (fractionMatch) {
    const whole = fractionMatch[1] ? parseInt(fractionMatch[1], 10) : 0;
    const numerator = parseInt(fractionMatch[2], 10);
    const denominator = parseInt(fractionMatch[3], 10);
    if (denominator !== 0) {
      return whole + numerator / denominator;
    }
  }

  // Try decimal
  const decimalMatch = str.match(/^(\d+(?:\.\d+)?)$/);
  if (decimalMatch) {
    return parseFloat(decimalMatch[1]);
  }

  return undefined;
}

/**
 * Unit categories for grouping related units
 */
interface UnitCategory {
  category: "volume" | "weight" | "count";
  canonical: string;
  conversionFactor?: number; // Conversion factor to canonical unit
}

/**
 * Map of all known units to their canonical form and category
 * Conversion factors are relative to the canonical unit
 */
const UNIT_MAP: Record<string, UnitCategory> = {
  // Volume - canonical: ml
  "ml": { category: "volume", canonical: "ml", conversionFactor: 1 },
  "milliliter": { category: "volume", canonical: "ml", conversionFactor: 1 },
  "milliliters": { category: "volume", canonical: "ml", conversionFactor: 1 },
  "l": { category: "volume", canonical: "ml", conversionFactor: 1000 },
  "liter": { category: "volume", canonical: "ml", conversionFactor: 1000 },
  "liters": { category: "volume", canonical: "ml", conversionFactor: 1000 },
  "tsp": { category: "volume", canonical: "ml", conversionFactor: 4.929 },
  "teaspoon": { category: "volume", canonical: "ml", conversionFactor: 4.929 },
  "teaspoons": { category: "volume", canonical: "ml", conversionFactor: 4.929 },
  "t": { category: "volume", canonical: "ml", conversionFactor: 4.929 },
  "tbsp": { category: "volume", canonical: "ml", conversionFactor: 14.787 },
  "tablespoon": { category: "volume", canonical: "ml", conversionFactor: 14.787 },
  "tablespoons": { category: "volume", canonical: "ml", conversionFactor: 14.787 },
  "tbs": { category: "volume", canonical: "ml", conversionFactor: 14.787 },
  "fl oz": { category: "volume", canonical: "ml", conversionFactor: 29.574 },
  "fl. oz": { category: "volume", canonical: "ml", conversionFactor: 29.574 },
  "fluid ounce": { category: "volume", canonical: "ml", conversionFactor: 29.574 },
  "fluid ounces": { category: "volume", canonical: "ml", conversionFactor: 29.574 },
  "cup": { category: "volume", canonical: "ml", conversionFactor: 236.588 },
  "cups": { category: "volume", canonical: "ml", conversionFactor: 236.588 },
  "c.": { category: "volume", canonical: "ml", conversionFactor: 236.588 },
  "c": { category: "volume", canonical: "ml", conversionFactor: 236.588 },
  "pt": { category: "volume", canonical: "ml", conversionFactor: 473.176 },
  "pint": { category: "volume", canonical: "ml", conversionFactor: 473.176 },
  "pints": { category: "volume", canonical: "ml", conversionFactor: 473.176 },
  "qt": { category: "volume", canonical: "ml", conversionFactor: 946.353 },
  "quart": { category: "volume", canonical: "ml", conversionFactor: 946.353 },
  "quarts": { category: "volume", canonical: "ml", conversionFactor: 946.353 },
  "gal": { category: "volume", canonical: "ml", conversionFactor: 3785.41 },
  "gallon": { category: "volume", canonical: "ml", conversionFactor: 3785.41 },
  "gallons": { category: "volume", canonical: "ml", conversionFactor: 3785.41 },

  // Weight - canonical: g
  "g": { category: "weight", canonical: "g", conversionFactor: 1 },
  "gram": { category: "weight", canonical: "g", conversionFactor: 1 },
  "grams": { category: "weight", canonical: "g", conversionFactor: 1 },
  "mg": { category: "weight", canonical: "g", conversionFactor: 0.001 },
  "milligram": { category: "weight", canonical: "g", conversionFactor: 0.001 },
  "milligrams": { category: "weight", canonical: "g", conversionFactor: 0.001 },
  "kg": { category: "weight", canonical: "g", conversionFactor: 1000 },
  "kilogram": { category: "weight", canonical: "g", conversionFactor: 1000 },
  "kilograms": { category: "weight", canonical: "g", conversionFactor: 1000 },
  "oz": { category: "weight", canonical: "g", conversionFactor: 28.3495 },
  "ounce": { category: "weight", canonical: "g", conversionFactor: 28.3495 },
  "ounces": { category: "weight", canonical: "g", conversionFactor: 28.3495 },
  "lb": { category: "weight", canonical: "g", conversionFactor: 453.592 },
  "lbs": { category: "weight", canonical: "g", conversionFactor: 453.592 },
  "pound": { category: "weight", canonical: "g", conversionFactor: 453.592 },
  "pounds": { category: "weight", canonical: "g", conversionFactor: 453.592 },

  // Count - no conversion (each is its own unit)
  "piece": { category: "count", canonical: "piece" },
  "pieces": { category: "count", canonical: "piece" },
  "clove": { category: "count", canonical: "clove" },
  "cloves": { category: "count", canonical: "clove" },
  "bulb": { category: "count", canonical: "bulb" },
  "bulbs": { category: "count", canonical: "bulb" },
  "head": { category: "count", canonical: "head" },
  "heads": { category: "count", canonical: "head" },
  "stalk": { category: "count", canonical: "stalk" },
  "stalks": { category: "count", canonical: "stalk" },
  "sprig": { category: "count", canonical: "sprig" },
  "sprigs": { category: "count", canonical: "sprig" },
  "pinch": { category: "count", canonical: "pinch" },
  "pinches": { category: "count", canonical: "pinch" },
  "dash": { category: "count", canonical: "dash" },
  "dashes": { category: "count", canonical: "dash" },
  "handful": { category: "count", canonical: "handful" },
  "handfuls": { category: "count", canonical: "handful" },
  "slice": { category: "count", canonical: "slice" },
  "slices": { category: "count", canonical: "slice" },
  "chunk": { category: "count", canonical: "chunk" },
  "chunks": { category: "count", canonical: "chunk" },
  "can": { category: "count", canonical: "can" },
  "cans": { category: "count", canonical: "can" },
  "jar": { category: "count", canonical: "jar" },
  "jars": { category: "count", canonical: "jar" },
  "package": { category: "count", canonical: "package" },
  "packages": { category: "count", canonical: "package" },
  "box": { category: "count", canonical: "box" },
  "boxes": { category: "count", canonical: "box" },
  "bunch": { category: "count", canonical: "bunch" },
  "bunches": { category: "count", canonical: "bunch" },
  "bottle": { category: "count", canonical: "bottle" },
  "bottles": { category: "count", canonical: "bottle" },
  "loaf": { category: "count", canonical: "loaf" },
  "loaves": { category: "count", canonical: "loaf" },
};

/**
 * Normalize a unit to its canonical form
 * Also returns category information for better aggregation decisions
 */
function normalizeUnit(unit?: string): { canonical: string; category: "volume" | "weight" | "count" } | undefined {
  if (!unit) return undefined;

  const normalized = unit.toLowerCase().trim();
  const unitInfo = UNIT_MAP[normalized];

  if (!unitInfo) return undefined;

  return {
    canonical: unitInfo.canonical,
    category: unitInfo.category,
  };
}

/**
 * Convert a quantity and unit to canonical form (ml for volume, g for weight, original for count)
 * Returns the converted quantity and canonical unit name
 */
export function convertToCanonical(quantity?: number, unit?: string): { quantity: number; unit: string } | undefined {
  if (quantity === undefined || !unit) return undefined;

  const normalized = unit.toLowerCase().trim();
  const unitInfo = UNIT_MAP[normalized];

  if (!unitInfo || !unitInfo.conversionFactor) {
    // For count units or unknown units, return as-is
    return { quantity, unit: unitInfo?.canonical || unit };
  }

  // Convert quantity using the conversion factor
  const convertedQuantity = quantity * unitInfo.conversionFactor;

  return {
    quantity: convertedQuantity,
    unit: unitInfo.canonical,
  };
}

/**
 * Check if two units are compatible (same category)
 */
function areUnitsCompatible(unit1?: string, unit2?: string): boolean {
  if (!unit1 || !unit2) return false;

  const normalized1 = normalizeUnit(unit1);
  const normalized2 = normalizeUnit(unit2);

  if (!normalized1 || !normalized2) return false;

  return normalized1.category === normalized2.category;
}


/**
 * Check if two items should be considered the same for aggregation
 */
function itemsMatch(item1: string, item2: string): boolean {
  const normalize = (str: string) =>
    str
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  return normalize(item1) === normalize(item2);
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

      // Add entry to item (don't aggregate quantities, just collect them for reference)
      existingItem.entries.push({
        recipe: recipe.name,
        quantity: parsed.quantity,
        unit: parsed.unit,
        original: parsed.original,
        ingredient: ingredientStr, // Store the original ingredient text
      });
    }
  }

  // Sort by item name and return as array
  return Array.from(itemMap.values()).sort((a, b) =>
    a.item.localeCompare(b.item)
  );
}




/**
 * Format a shopping list item for display - just the ingredient name
 * The entries array will show the actual measurements from each recipe
 */
export function formatShoppingListItem(item: ShoppingListItem): string {
  // Just return the ingredient name - the component will show the measurements
  return item.item;
}


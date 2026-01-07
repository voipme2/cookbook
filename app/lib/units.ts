/**
 * Unit definitions and conversion utilities for ingredient parsing
 */

/**
 * Common cooking units and their abbreviations
 */
export const UNITS = [
  // Volume
  "cup", "cups", "c.", "c",
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
  "package", "packages", "packet", "packets",
  "box", "boxes",
  "bunch", "bunches",
  "bottle", "bottles",
  "loaf", "loaves",
] as const;

/**
 * Build regex that handles units with optional leading hyphen (e.g., "-ounce")
 * Also handle units with trailing period (e.g., "c.")
 */
export const UNIT_REGEX = new RegExp(
  `^(?:-)?(${UNITS.map(u => u.replace(/\./g, "\\.?")).join("|")})(?:\\.|\\s|$)`,
  "i"
);

/**
 * Unit categories for grouping related units
 */
export interface UnitCategory {
  category: "volume" | "weight" | "count";
  canonical: string;
  conversionFactor?: number;
}

/**
 * Map of all known units to their canonical form and category
 * Conversion factors are relative to the canonical unit
 */
export const UNIT_MAP: Record<string, UnitCategory> = {
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
 */
export function normalizeUnit(
  unit?: string
): { canonical: string; category: "volume" | "weight" | "count" } | undefined {
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
 * Convert a quantity and unit to canonical form
 */
export function convertToCanonical(
  quantity?: number,
  unit?: string
): { quantity: number; unit: string } | undefined {
  if (quantity === undefined || !unit) return undefined;

  const normalized = unit.toLowerCase().trim();
  const unitInfo = UNIT_MAP[normalized];

  if (!unitInfo || !unitInfo.conversionFactor) {
    return { quantity, unit: unitInfo?.canonical || unit };
  }

  return {
    quantity: quantity * unitInfo.conversionFactor,
    unit: unitInfo.canonical,
  };
}

/**
 * Check if two units are compatible (same category)
 */
export function areUnitsCompatible(unit1?: string, unit2?: string): boolean {
  if (!unit1 || !unit2) return false;

  const normalized1 = normalizeUnit(unit1);
  const normalized2 = normalizeUnit(unit2);

  if (!normalized1 || !normalized2) return false;

  return normalized1.category === normalized2.category;
}

/**
 * Ingredient parsing utilities
 * Handles parsing of ingredient strings into structured data
 */

import { UNIT_MAP, UNIT_REGEX } from "./units";

/**
 * Represents a parsed ingredient with quantity and unit
 */
export interface ParsedIngredient {
  original: string;
  item: string;
  quantity?: number;
  unit?: string;
  rawQuantity?: string;
}

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
  remaining = remaining
    .replace(/^[\s\-–]+/i, "")
    .replace(/^(to|or|about|approximately|roughly|around)\s+/i, "")
    .trim();

  // Stage 2: Extract quantity
  const mixedNumberRegex = /^(\d+)\s+(\d+)\/(\d+)\s+/;
  const mixedNumberMatch = remaining.match(mixedNumberRegex);

  let quantity: number | undefined;
  let rawQuantity: string | undefined;
  let unit: string | undefined;

  if (mixedNumberMatch) {
    const whole = parseInt(mixedNumberMatch[1], 10);
    const numerator = parseInt(mixedNumberMatch[2], 10);
    const denominator = parseInt(mixedNumberMatch[3], 10);
    quantity = whole + numerator / denominator;
    rawQuantity = `${whole} ${numerator}/${denominator}`;
    remaining = remaining.substring(mixedNumberMatch[0].length).trim();
  } else {
    const quantityRegex =
      /^([\d\/⁄\-\.½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]+(?:\s+(?:to|and|or|[-–])\s+[\d\/⁄\-\.½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]+)?)(?:\s+|$)/;
    const quantityMatch = remaining.match(quantityRegex);

    if (quantityMatch) {
      rawQuantity = quantityMatch[1].trim();
      remaining = remaining.substring(quantityMatch[0].length).trim();
      quantity = parseQuantity(rawQuantity.replace(/⁄/g, "/"));
    }
  }

  // Stage 3: Extract unit
  const unitMatch = remaining.match(UNIT_REGEX);
  if (unitMatch) {
    const matchedUnit = unitMatch[1].toLowerCase();
    const unitInfo = UNIT_MAP[matchedUnit];
    unit = unitInfo ? unitInfo.canonical : matchedUnit;
    remaining = remaining.substring(unitMatch[0].length).trim();
  }

  // Stage 4: Handle "of" connector
  remaining = remaining.replace(/^of\s+/i, "");

  // Stage 5: Remove packaging words
  remaining = remaining.replace(
    /^(packet|packets|package|packages|can|cans|jar|jars|box|boxes|bottle|bottles)\s+/i,
    ""
  );

  // Stage 6: Remove trailing descriptors and preparation methods
  let item = remaining
    .replace(
      /,?\s+((?:diced|chopped|minced|sliced|grated|shredded|crushed|whole|fresh|dried|melted|softened|peeled|cooked|raw|ground|divided|packed|loosely packed|tightly packed|to taste|roughly|finely|coarsely|thinly|thickly)(?:\s+and\s+(?:(?:roughly|finely|coarsely|thinly|thickly)\s+)?(?:diced|chopped|minced|sliced|grated|shredded|crushed|whole|fresh|dried|melted|softened|peeled|cooked|raw|ground|divided|packed|loosely packed|tightly packed|to taste))*)[\s,]*$/i,
      ""
    )
    .replace(/,?\s*(?:plus|reserved)\s+more\s+for\s+\w+.*$/i, "")
    .replace(
      /^(fresh|dried|ground|chopped|diced|minced|raw|cooked|roughly|finely|coarsely)\s+/i,
      (match, descriptor) => {
        if (quantity !== undefined || unit !== undefined) {
          return "";
        }
        return match;
      }
    )
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Stage 7: Remove common generic count terms
  item = item
    .replace(
      /\s+(cloves?|pieces?|chunks?|slices?|stalks?|sprigs?|bulbs?|heads?|bunches?|handfuls?|leaves?)$/i,
      ""
    )
    .toLowerCase()
    .trim();

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
 */
export function parseQuantity(quantityStr: string): number | undefined {
  const str = quantityStr.trim().toLowerCase();
  if (!str) return undefined;

  // Handle ranges with "to"
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

  // Handle "X and Y"
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
 * Check if two items should be considered the same for aggregation
 */
export function itemsMatch(item1: string, item2: string): boolean {
  const normalize = (str: string) =>
    str
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  return normalize(item1) === normalize(item2);
}

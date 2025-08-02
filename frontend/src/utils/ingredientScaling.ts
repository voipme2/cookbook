// Utility functions for scaling recipe ingredients

interface ParsedIngredient {
  amount: number;
  unit: string;
  item: string;
  original: string;
}

// Convert fractions to decimals
function fractionToDecimal(fraction: string): number {
  // Handle both regular slash (/) and Unicode fraction slash (⁄)
  const normalizedFraction = fraction.replace(/⁄/g, '/');
  const parts = normalizedFraction.split('/');
  if (parts.length === 2) {
    const numerator = parseFloat(parts[0]);
    const denominator = parseFloat(parts[1]);
    return numerator / denominator;
  }
  return parseFloat(fraction) || 0;
}

// Parse mixed numbers like "1 1/2" or "2 3/4"
function parseMixedNumber(text: string): number {
  // Handle both regular slash (/) and Unicode fraction slash (⁄)
  const normalizedText = text.replace(/⁄/g, '/');
  const mixedMatch = normalizedText.match(/^(\d+)\s+(\d+\/\d+)$/);
  if (mixedMatch) {
    const whole = parseFloat(mixedMatch[1]);
    const fraction = fractionToDecimal(mixedMatch[2]);
    return whole + fraction;
  }
  return 0;
}

// Parse ingredient text to extract amount, unit, and item
export function parseIngredient(ingredientText: string): ParsedIngredient {
  const text = ingredientText.trim();
  
  // Common patterns for ingredient parsing
  const patterns = [
    // "2 cups flour" or "1/2 cup sugar" or "1⁄4 teaspoon"
    /^([\d⁄\/\s\.]+)\s+([a-zA-Z]+)\s+(.+)$/,
    // "2 large eggs" (no unit)
    /^([\d⁄\/\s\.]+)\s+(.+)$/,
    // "salt to taste" (no amount)
    /^(.+)$/
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      if (match.length === 4) {
        // Has amount, unit, and item
        const amountStr = match[1].trim();
        const unit = match[2].trim();
        const item = match[3].trim();
        
        let amount = 0;
        
        // Handle mixed numbers like "1 1/2"
        if (amountStr.includes(' ')) {
          amount = parseMixedNumber(amountStr);
        } else if (amountStr.includes('/') || amountStr.includes('⁄')) {
          // Handle fractions like "1/2" or "1⁄4"
          amount = fractionToDecimal(amountStr);
        } else {
          // Handle decimals and whole numbers
          amount = parseFloat(amountStr) || 0;
        }
        
        return { amount, unit, item, original: text };
      } else if (match.length === 3) {
        // Has amount and item (no unit)
        const amountStr = match[1].trim();
        const item = match[2].trim();
        
        let amount = 0;
        if (amountStr.includes(' ')) {
          amount = parseMixedNumber(amountStr);
        } else if (amountStr.includes('/') || amountStr.includes('⁄')) {
          amount = fractionToDecimal(amountStr);
        } else {
          amount = parseFloat(amountStr) || 0;
        }
        
        return { amount, unit: '', item, original: text };
      } else {
        // No amount (like "salt to taste")
        return { amount: 0, unit: '', item: text, original: text };
      }
    }
  }
  
  // Fallback
  return { amount: 0, unit: '', item: text, original: text };
}

// Convert decimal back to readable format
function formatAmount(amount: number): string {
  if (amount === 0) return '';
  
  // Handle common fractions
  const fractions: { [key: number]: string } = {
    0.125: '1/8',
    0.167: '1/6',
    0.25: '1/4',
    0.33: '1/3',
    0.375: '3/8',
    0.5: '1/2',
    0.625: '5/8',
    0.67: '2/3',
    0.75: '3/4',
    0.833: '5/6',
    0.875: '7/8',
    // More precise fractions
    0.0625: '1/16',
    0.1875: '3/16',
    0.3125: '5/16',
    0.4375: '7/16',
    0.5625: '9/16',
    0.6875: '11/16',
    0.8125: '13/16',
    0.9375: '15/16'
  };
  
  const whole = Math.floor(amount);
  const decimal = amount - whole;
  
  // Check if decimal matches a common fraction
  const fraction = fractions[Math.round(decimal * 10000) / 10000];
  
  if (whole === 0) {
    return fraction || amount.toString();
  } else if (decimal === 0) {
    return whole.toString();
  } else if (fraction) {
    return `${whole} ${fraction}`;
  } else {
    return amount.toString();
  }
}

// Normalize units to singular forms
function normalizeUnit(unit: string): string {
  const unitMap: { [key: string]: string } = {
    'cups': 'cup',
    'cup': 'cup',
    'tablespoons': 'tbsp',
    'tablespoon': 'tbsp',
    'tbsp': 'tbsp',
    'teaspoons': 'tsp',
    'teaspoon': 'tsp',
    'tsp': 'tsp',
    'ounces': 'oz',
    'ounce': 'oz',
    'oz': 'oz',
    'pounds': 'lb',
    'pound': 'lb',
    'lb': 'lb',
    'grams': 'g',
    'gram': 'g',
    'g': 'g',
    'kilograms': 'kg',
    'kilogram': 'kg',
    'kg': 'kg',
    'milliliters': 'ml',
    'milliliter': 'ml',
    'ml': 'ml',
    'liters': 'l',
    'liter': 'l',
    'l': 'l'
  };
  
  return unitMap[unit.toLowerCase()] || unit;
}

// Convert cups to tablespoons or teaspoons for small amounts
function convertToPracticalMeasurements(amount: number, unit: string): { amount: number; unit: string } {
  // Convert cups to tablespoons for small amounts
  if (unit.toLowerCase() === 'cup' || unit.toLowerCase() === 'cups') {
    if (amount <= 0.25) {
      // Convert to tablespoons (1 cup = 16 tablespoons)
      const tablespoons = amount * 16;
      if (tablespoons >= 1) {
        return { amount: Math.round(tablespoons * 4) / 4, unit: 'tbsp' };
      } else {
        // Convert to teaspoons (1 tablespoon = 3 teaspoons)
        const teaspoons = tablespoons * 3;
        return { amount: Math.round(teaspoons * 4) / 4, unit: 'tsp' };
      }
    }
  }
  
  // Convert tablespoons to teaspoons for small amounts
  if (unit.toLowerCase() === 'tbsp' || unit.toLowerCase() === 'tablespoon' || unit.toLowerCase() === 'tablespoons') {
    if (amount < 1) {
      const teaspoons = amount * 3;
      return { amount: Math.round(teaspoons * 4) / 4, unit: 'tsp' };
    }
  }
  
  // Convert teaspoons to tablespoons when scaling up
  if (unit.toLowerCase() === 'tsp' || unit.toLowerCase() === 'teaspoon' || unit.toLowerCase() === 'teaspoons') {
    if (amount >= 3) {
      const tablespoons = amount / 3;
      if (tablespoons >= 1) {
        return { amount: Math.round(tablespoons * 4) / 4, unit: 'tbsp' };
      }
    }
  }
  
  // Convert tablespoons to cups when scaling up
  if (unit.toLowerCase() === 'tbsp' || unit.toLowerCase() === 'tablespoon' || unit.toLowerCase() === 'tablespoons') {
    if (amount >= 16) {
      const cups = amount / 16;
      return { amount: Math.round(cups * 4) / 4, unit: 'cup' };
    }
  }
  
  // Don't convert teaspoons to anything else - keep them as teaspoons
  if (unit.toLowerCase() === 'tsp' || unit.toLowerCase() === 'teaspoon' || unit.toLowerCase() === 'teaspoons') {
    return { amount, unit: 'tsp' };
  }
  
  return { amount, unit };
}

// Scale an ingredient by a factor
export function scaleIngredient(ingredientText: string, factor: number): string {
  // If scaling factor is 1 (original), return the ingredient as-is
  if (factor === 1) {
    return ingredientText;
  }
  
  // Check if ingredient contains multiple measurements (e.g., "1 tsp salt or 1 tsp salt")
  const orPattern = /\s+or\s+/i;
  if (orPattern.test(ingredientText)) {
    // Split by "or" and scale each part
    const parts = ingredientText.split(orPattern);
    const scaledParts = parts.map(part => scaleIngredient(part.trim(), factor));
    return scaledParts.join(' or ');
  }
  
  const parsed = parseIngredient(ingredientText);
  
  if (parsed.amount === 0) {
    // No amount to scale (like "salt to taste")
    return parsed.original;
  }
  
  const scaledAmount = parsed.amount * factor;
  
  // Normalize the unit to singular form
  const normalizedUnit = normalizeUnit(parsed.unit);
  
  // Convert to practical measurements if applicable
  const { amount: practicalAmount, unit: practicalUnit } = convertToPracticalMeasurements(scaledAmount, normalizedUnit);
  
  const formattedAmount = formatAmount(practicalAmount);
  
  if (practicalUnit) {
    return `${formattedAmount} ${practicalUnit} ${parsed.item}`;
  } else {
    return `${formattedAmount} ${parsed.item}`;
  }
}

// Scale all ingredients in a recipe
export function scaleIngredients(ingredients: { text: string }[], factor: number): { text: string }[] {
  return ingredients.map(ingredient => ({
    text: scaleIngredient(ingredient.text, factor)
  }));
}

// Get scaling options
export const SCALING_OPTIONS = [
  { value: 0.5, label: 'Half (0.5x)' },
  { value: 0.75, label: 'Three-quarters (0.75x)' },
  { value: 1, label: 'Original (1x)' },
  { value: 1.5, label: 'One and a half (1.5x)' },
  { value: 2, label: 'Double (2x)' },
  { value: 3, label: 'Triple (3x)' },
  { value: 4, label: 'Quadruple (4x)' }
]; 
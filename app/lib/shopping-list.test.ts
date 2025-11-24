import { parseIngredient, generateShoppingList, formatShoppingListItem } from './shopping-list';
import type { Recipe } from '~/types';

/**
 * Test cases for shopping list feature
 * These are examples of how the ingredient parser handles various formats
 */

describe('parseIngredient', () => {
  it('parses simple quantity and unit', () => {
    const result = parseIngredient('2 cups flour');
    expect(result.quantity).toBe(2);
    expect(result.unit).toBe('cups');
    expect(result.item).toBe('flour');
  });

  it('parses fractions', () => {
    const result = parseIngredient('1/2 cup sugar');
    expect(result.quantity).toBe(0.5);
    expect(result.unit).toBe('cup');
    expect(result.item).toBe('sugar');
  });

  it('parses mixed numbers', () => {
    const result = parseIngredient('1 1/2 tablespoons butter');
    expect(result.quantity).toBe(1.5);
    expect(result.unit).toBe('tablespoons');
    expect(result.item).toBe('butter');
  });

  it('parses ranges as average', () => {
    const result = parseIngredient('2-3 cloves garlic');
    expect(result.quantity).toBe(2.5);
    expect(result.unit).toBe('cloves');
    expect(result.item).toBe('garlic');
  });

  it('parses ingredients without quantities', () => {
    const result = parseIngredient('fresh basil');
    expect(result.quantity).toBeUndefined();
    expect(result.unit).toBeUndefined();
    expect(result.item).toBe('fresh basil');
  });

  it('removes common preparation descriptions', () => {
    const result = parseIngredient('1 cup tomatoes, diced');
    expect(result.item).toContain('tomato');
    expect(result.item).not.toContain('diced');
  });

  it('handles abbreviated units', () => {
    const result = parseIngredient('1 tbsp olive oil');
    expect(result.unit).toBe('tablespoons');
    expect(result.item).toBe('olive oil');
  });

  it('normalizes unit names', () => {
    const result = parseIngredient('500 grams flour');
    expect(result.quantity).toBe(500);
    expect(result.unit).toMatch(/gram|g/i);
  });

  it('extracts ingredient from "cloves garlic, minced"', () => {
    const result = parseIngredient('2 cloves garlic, minced');
    expect(result.item).toBe('garlic');
    expect(result.quantity).toBe(2);
    expect(result.unit).toBe('cloves');
  });

  it('extracts ingredient from range "1/2 to 3/4 cup flour"', () => {
    const result = parseIngredient('1/2 to 3/4 cup flour');
    expect(result.item).toBe('flour');
    expect(result.quantity).toBe(0.625); // average of 0.5 and 0.75
    expect(result.unit).toBe('cup');
  });

  it('extracts ingredient from "pinch of salt"', () => {
    const result = parseIngredient('pinch of salt');
    expect(result.item).toBe('salt');
    expect(result.unit).toBe('pinch');
    expect(result.quantity).toBeUndefined();
  });

  it('handles fresh descriptors properly', () => {
    const result = parseIngredient('fresh basil');
    expect(result.item).toBe('basil');
    expect(result.quantity).toBeUndefined();
    expect(result.unit).toBeUndefined();
  });

  it('removes parenthetical notes', () => {
    const result = parseIngredient('1 cup flour (all-purpose)');
    expect(result.item).toBe('flour');
    expect(result.unit).toBe('cup');
  });

  it('handles "to taste" descriptions', () => {
    const result = parseIngredient('salt, to taste');
    expect(result.item).toBe('salt');
  });

  it('correctly parses mixed numbers like "1 1/2 tablespoons black pepper"', () => {
    const result = parseIngredient('1 1/2 tablespoons black pepper');
    expect(result.item).toBe('black pepper');
    expect(result.quantity).toBe(1.5);
    expect(result.unit).toBe('tablespoons');
  });

  it('correctly parses other mixed numbers', () => {
    const result = parseIngredient('2 3/4 cups flour');
    expect(result.item).toBe('flour');
    expect(result.quantity).toBe(2.75);
    expect(result.unit).toBe('cups');
  });

  it('handles units with leading hyphen like "-ounce"', () => {
    const result = parseIngredient('1 1/4 -ounce packet active dry yeast');
    expect(result.item).toBe('active dry yeast');
    expect(result.quantity).toBe(1.25);
    expect(result.unit).toBe('ounce');
  });

  it('removes packaging words like "packet"', () => {
    const result = parseIngredient('1 packet active dry yeast');
    expect(result.item).toBe('active dry yeast');
    expect(result.unit).toBe('packet');
  });

  it('handles multiple prep descriptors with "and"', () => {
    const result = parseIngredient('6 cups apples, peeled and thinly sliced');
    expect(result.item).toBe('apples');
    expect(result.quantity).toBe(6);
    expect(result.unit).toBe('cups');
  });

  it('handles cup abbreviation "c."', () => {
    const result = parseIngredient('1 c. chicken stock or broth');
    expect(result.item).toBe('chicken stock or broth');
    expect(result.quantity).toBe(1);
    expect(result.unit).toBe('cup');
  });

  it('handles cup abbreviation "c"', () => {
    const result = parseIngredient('2 c flour');
    expect(result.item).toBe('flour');
    expect(result.quantity).toBe(2);
    expect(result.unit).toBe('cup');
  });
});

describe('generateShoppingList', () => {
  it('groups matching ingredients from multiple recipes', () => {
    const recipes: Recipe[] = [
      {
        id: '1',
        name: 'Cookies',
        ingredients: ['2 cups flour', '1 cup butter'],
      },
      {
        id: '2',
        name: 'Cake',
        ingredients: ['1.5 cups flour', '0.5 cup butter'],
      },
    ] as Recipe[];

    const list = generateShoppingList(recipes);
    
    const flourItem = list.find(item => item.item.toLowerCase().includes('flour'));
    expect(flourItem).toBeDefined();
    expect(flourItem?.entries.length).toBe(2);
  });

  it('groups same ingredient from different recipes', () => {
    const recipes: Recipe[] = [
      {
        id: '1',
        name: 'Recipe1',
        ingredients: ['3 cloves garlic'],
      },
      {
        id: '2',
        name: 'Recipe2',
        ingredients: ['2 cloves garlic'],
      },
    ] as Recipe[];

    const list = generateShoppingList(recipes);
    const garlicItem = list.find(item => item.item.toLowerCase().includes('garlic'));
    
    expect(garlicItem).toBeDefined();
    expect(garlicItem?.entries.length).toBe(2);
  });

  it('sorts items alphabetically', () => {
    const recipes: Recipe[] = [
      {
        id: '1',
        name: 'Recipe',
        ingredients: ['2 cups flour', '1 lb butter', '3 eggs'],
      },
    ] as Recipe[];

    const list = generateShoppingList(recipes);
    const items = list.map(item => item.item.toLowerCase());
    
    for (let i = 0; i < items.length - 1; i++) {
      expect(items[i].localeCompare(items[i + 1])).toBeLessThanOrEqual(0);
    }
  });

  it('handles recipes with no ingredients', () => {
    const recipes: Recipe[] = [
      {
        id: '1',
        name: 'Recipe',
        ingredients: undefined,
      },
    ] as Recipe[];

    expect(() => generateShoppingList(recipes)).not.toThrow();
  });

  it('tracks original ingredient text in entries', () => {
    const recipes: Recipe[] = [
      {
        id: '1',
        name: 'Recipe1',
        ingredients: ['2 cloves garlic, minced'],
      },
    ] as Recipe[];

    const list = generateShoppingList(recipes);
    const garlicItem = list.find(item => item.item.toLowerCase().includes('garlic'));
    
    expect(garlicItem).toBeDefined();
    expect(garlicItem?.entries[0].ingredient).toBe('2 cloves garlic, minced');
  });
});

describe('formatShoppingListItem', () => {
  it('formats item to string', () => {
    const result = formatShoppingListItem({
      item: 'flour',
      entries: [],
    });

    expect(result).toBe('flour');
  });

  it('formats various items', () => {
    expect(formatShoppingListItem({ item: 'salt', entries: [] })).toBe('salt');
    expect(formatShoppingListItem({ item: 'butter', entries: [] })).toBe('butter');
  });
});


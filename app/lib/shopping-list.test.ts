import { describe, it, expect } from 'vitest';
import { parseIngredient, generateShoppingList, formatShoppingListItem } from './shopping-list';
import type { Recipe } from '~/types';

describe('parseIngredient', () => {
  describe('quantity parsing', () => {
    it('parses simple whole numbers', () => {
      const result = parseIngredient('2 cups flour');
      expect(result.quantity).toBe(2);
      expect(result.unit).toBe('ml'); // normalized to canonical form
      expect(result.item).toBe('flour');
      expect(result.original).toBe('2 cups flour');
    });

    it('parses decimal numbers', () => {
      const result = parseIngredient('1.5 cups sugar');
      expect(result.quantity).toBe(1.5);
      expect(result.unit).toBe('ml');
      expect(result.item).toBe('sugar');
    });

    it('parses simple fractions', () => {
      const result = parseIngredient('1/2 cup milk');
      expect(result.quantity).toBe(0.5);
      expect(result.unit).toBe('ml');
      expect(result.item).toBe('milk');
    });

    it('parses mixed numbers', () => {
      const result = parseIngredient('1 1/2 tablespoons butter');
      expect(result.quantity).toBe(1.5);
      expect(result.unit).toBe('ml');
      expect(result.item).toBe('butter');
      expect(result.rawQuantity).toBe('1 1/2');
    });

    it('parses ranges with dash', () => {
      const result = parseIngredient('2-3 cloves garlic');
      expect(result.quantity).toBe(2.5); // average
      expect(result.unit).toBe('clove');
      expect(result.item).toBe('garlic');
    });

    it('parses ranges with "to"', () => {
      const result = parseIngredient('1/2 to 3/4 cup flour');
      expect(result.quantity).toBe(0.625); // average of 0.5 and 0.75
      expect(result.unit).toBe('ml');
      expect(result.item).toBe('flour');
    });

    it('handles ingredients without quantities', () => {
      const result = parseIngredient('fresh basil');
      expect(result.quantity).toBeUndefined();
      expect(result.unit).toBeUndefined();
      expect(result.item).toBe('fresh basil'); // preserved when no quantity/unit
    });
  });

  describe('unit normalization', () => {
    it('normalizes volume units to ml', () => {
      expect(parseIngredient('1 cup water').unit).toBe('ml');
      expect(parseIngredient('1 cups water').unit).toBe('ml');
      expect(parseIngredient('1 c. water').unit).toBe('ml');
      expect(parseIngredient('1 c water').unit).toBe('ml');
      expect(parseIngredient('1 tbsp oil').unit).toBe('ml');
      expect(parseIngredient('1 tablespoon oil').unit).toBe('ml');
      expect(parseIngredient('1 tablespoons oil').unit).toBe('ml');
      expect(parseIngredient('1 tsp salt').unit).toBe('ml');
      expect(parseIngredient('1 teaspoon salt').unit).toBe('ml');
    });

    it('normalizes weight units to g', () => {
      expect(parseIngredient('500 grams flour').unit).toBe('g');
      expect(parseIngredient('500 g flour').unit).toBe('g');
      expect(parseIngredient('1 lb butter').unit).toBe('g');
      expect(parseIngredient('1 pound butter').unit).toBe('g');
      expect(parseIngredient('1 oz cheese').unit).toBe('g');
      expect(parseIngredient('1 ounce cheese').unit).toBe('g');
    });

    it('normalizes count units to canonical form', () => {
      expect(parseIngredient('2 cloves garlic').unit).toBe('clove');
      expect(parseIngredient('3 clove garlic').unit).toBe('clove');
      expect(parseIngredient('1 pinch salt').unit).toBe('pinch');
      expect(parseIngredient('2 pinches salt').unit).toBe('pinch');
      // Note: "packet" and "packets" are recognized as units but not in UNIT_MAP, so they stay as-is
      expect(parseIngredient('1 packet yeast').unit).toBe('packet');
      expect(parseIngredient('2 packets yeast').unit).toBe('packets');
    });

    it('handles units with leading hyphen', () => {
      const result = parseIngredient('1 1/4 -ounce packet active dry yeast');
      expect(result.quantity).toBe(1.25);
      expect(result.unit).toBe('g'); // ounce is weight, normalized to g
      expect(result.item).toBe('active dry yeast');
    });
  });

  describe('ingredient name extraction', () => {
    it('extracts simple ingredient names', () => {
      expect(parseIngredient('2 cups flour').item).toBe('flour');
      expect(parseIngredient('1 cup sugar').item).toBe('sugar');
      expect(parseIngredient('3 eggs').item).toBe('eggs');
    });

    it('removes trailing prep descriptors after comma', () => {
      expect(parseIngredient('2 cloves garlic, minced').item).toBe('garlic');
      expect(parseIngredient('1 cup tomatoes, diced').item).toBe('tomatoes');
      expect(parseIngredient('salt, to taste').item).toBe('salt');
    });

    it('removes multiple prep descriptors with "and"', () => {
      const result = parseIngredient('6 cups apples, peeled and thinly sliced');
      expect(result.item).toBe('apples');
      expect(result.quantity).toBe(6);
      expect(result.unit).toBe('ml');
    });

    it('removes parenthetical notes', () => {
      expect(parseIngredient('1 cup flour (all-purpose)').item).toBe('flour');
      expect(parseIngredient('2 tbsp butter (melted)').item).toBe('butter');
    });

    it('removes packaging words from item name', () => {
      expect(parseIngredient('1 packet active dry yeast').item).toBe('active dry yeast');
      expect(parseIngredient('1 can tomatoes').item).toBe('tomatoes');
      expect(parseIngredient('1 jar pickles').item).toBe('pickles');
    });

    it('removes leading descriptors when quantity/unit present', () => {
      expect(parseIngredient('1 cup fresh basil').item).toBe('basil');
      expect(parseIngredient('2 tbsp dried oregano').item).toBe('oregano');
    });

    it('preserves leading descriptors when no quantity/unit', () => {
      expect(parseIngredient('fresh basil').item).toBe('fresh basil');
      expect(parseIngredient('dried herbs').item).toBe('dried herbs');
    });

    it('removes generic count terms from item name', () => {
      expect(parseIngredient('2 garlic cloves').item).toBe('garlic');
      expect(parseIngredient('3 onion pieces').item).toBe('onion');
    });

    it('handles "of" connector', () => {
      expect(parseIngredient('pinch of salt').item).toBe('salt');
      expect(parseIngredient('clove of garlic').item).toBe('garlic');
    });

    it('converts item names to lowercase', () => {
      expect(parseIngredient('2 CUPS FLOUR').item).toBe('flour');
      expect(parseIngredient('1 Cup Sugar').item).toBe('sugar');
    });
  });

  describe('edge cases', () => {
    it('handles empty strings', () => {
      const result = parseIngredient('');
      expect(result.original).toBe('');
      expect(result.item).toBe('');
    });

    it('handles whitespace-only strings', () => {
      const result = parseIngredient('   ');
      // Original is trimmed, so whitespace-only becomes empty
      expect(result.original).toBe('');
      expect(result.item).toBe('');
    });

    it('handles ingredients with only unit', () => {
      const result = parseIngredient('pinch of salt');
      expect(result.quantity).toBeUndefined();
      expect(result.unit).toBe('pinch');
      expect(result.item).toBe('salt');
    });

    it('handles ingredients with only quantity', () => {
      const result = parseIngredient('2 eggs');
      expect(result.quantity).toBe(2);
      expect(result.unit).toBeUndefined();
      expect(result.item).toBe('eggs');
    });

    it('preserves original string', () => {
      const input = '2 cups flour, sifted';
      const result = parseIngredient(input);
      expect(result.original).toBe(input);
    });

    it('preserves rawQuantity for mixed numbers', () => {
      const result = parseIngredient('1 1/2 cups milk');
      expect(result.rawQuantity).toBe('1 1/2');
    });
  });
});

describe('generateShoppingList', () => {
  it('creates shopping list from single recipe', () => {
    const recipes: Recipe[] = [
      {
        id: '1',
        name: 'Cookies',
        ingredients: ['2 cups flour', '1 cup butter', '3 eggs'],
      },
    ] as Recipe[];

    const list = generateShoppingList(recipes);
    
    expect(list).toHaveLength(3);
    expect(list[0].item).toBe('butter');
    expect(list[1].item).toBe('eggs');
    expect(list[2].item).toBe('flour');
  });

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
    
    const flourItem = list.find(item => item.item === 'flour');
    expect(flourItem).toBeDefined();
    expect(flourItem?.entries).toHaveLength(2);
    expect(flourItem?.entries[0].recipe).toBe('Cookies');
    expect(flourItem?.entries[1].recipe).toBe('Cake');
  });

  it('matches ingredients by normalized item name', () => {
    const recipes: Recipe[] = [
      {
        id: '1',
        name: 'Recipe1',
        ingredients: ['2 cloves garlic'],
      },
      {
        id: '2',
        name: 'Recipe2',
        ingredients: ['3 clove garlic'],
      },
    ] as Recipe[];

    const list = generateShoppingList(recipes);
    const garlicItem = list.find(item => item.item === 'garlic');
    
    expect(garlicItem).toBeDefined();
    expect(garlicItem?.entries).toHaveLength(2);
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
    const items = list.map(item => item.item);
    
    expect(items).toEqual(['butter', 'eggs', 'flour']);
  });

  it('handles recipes with no ingredients', () => {
    const recipes: Recipe[] = [
      {
        id: '1',
        name: 'Recipe',
        ingredients: undefined,
      },
      {
        id: '2',
        name: 'Recipe2',
        ingredients: [],
      },
    ] as Recipe[];

    const list = generateShoppingList(recipes);
    expect(list).toHaveLength(0);
  });

  it('handles recipes with invalid ingredients', () => {
    const recipes: Recipe[] = [
      {
        id: '1',
        name: 'Recipe',
        ingredients: ['valid ingredient', null as any, '', undefined as any],
      },
    ] as Recipe[];

    const list = generateShoppingList(recipes);
    expect(list).toHaveLength(1);
    // "valid" is not a prep descriptor, so it stays in the item name
    expect(list[0].item).toBe('valid ingredient');
  });

  it('stores original ingredient text in entries', () => {
    const recipes: Recipe[] = [
      {
        id: '1',
        name: 'Recipe1',
        ingredients: ['2 cloves garlic, minced'],
      },
    ] as Recipe[];

    const list = generateShoppingList(recipes);
    const garlicItem = list.find(item => item.item === 'garlic');
    
    expect(garlicItem).toBeDefined();
    expect(garlicItem?.entries[0].ingredient).toBe('2 cloves garlic, minced');
    expect(garlicItem?.entries[0].original).toBe('2 cloves garlic, minced');
  });

  it('stores parsed quantity and unit in entries', () => {
    const recipes: Recipe[] = [
      {
        id: '1',
        name: 'Recipe1',
        ingredients: ['2 cups flour'],
      },
    ] as Recipe[];

    const list = generateShoppingList(recipes);
    const flourItem = list.find(item => item.item === 'flour');
    
    expect(flourItem?.entries[0].quantity).toBe(2);
    expect(flourItem?.entries[0].unit).toBe('ml');
  });

  it('handles ingredients without quantities or units', () => {
    const recipes: Recipe[] = [
      {
        id: '1',
        name: 'Recipe1',
        ingredients: ['fresh basil', 'salt'],
      },
    ] as Recipe[];

    const list = generateShoppingList(recipes);
    
    const basilItem = list.find(item => item.item === 'fresh basil');
    expect(basilItem).toBeDefined();
    expect(basilItem?.entries[0].quantity).toBeUndefined();
    expect(basilItem?.entries[0].unit).toBeUndefined();
  });
});

describe('formatShoppingListItem', () => {
  it('returns the item name', () => {
    const item = {
      item: 'flour',
      entries: [],
    };
    expect(formatShoppingListItem(item)).toBe('flour');
  });

  it('works with any item name', () => {
    expect(formatShoppingListItem({ item: 'salt', entries: [] })).toBe('salt');
    expect(formatShoppingListItem({ item: 'butter', entries: [] })).toBe('butter');
    expect(formatShoppingListItem({ item: 'fresh basil', entries: [] })).toBe('fresh basil');
  });
});

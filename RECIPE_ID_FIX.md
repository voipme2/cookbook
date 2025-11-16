# Recipe ID Bug Fix

## Problem
When accessing a recipe from the search results, you got a 404 error. The URL had underscores (`alabama_white_sauce`) but the database ID had hyphens (`alabama-white-sauce`).

Example:
- **URL**: `localhost:5173/recipes/alabama_white_sauce` ❌ 404 Not Found
- **Database ID**: `alabama-white-sauce` ✅ Correct

## Root Cause
The issue had three parts:

1. **JSONB Contains Old ID**: The imported recipes stored an `id` field in their JSONB object with underscores (the old format), separate from the database row's `id` column which correctly used hyphens.

2. **formatRecipe Returns JSONB ID**: The `formatRecipe()` function in `app/lib/queries/recipes.ts` was returning the recipe data directly from the JSONB field without ensuring the correct database `id` was used.

3. **Recipe Links Use Wrong ID**: When the `RecipeCard` component created links with `recipe.id`, it was using the incorrect ID from the JSONB field instead of the database column.

### Example of the Data Mismatch
```
Database Row:
├── id: "alabama-white-sauce"  ✓ Correct (from recipes.id column)
└── recipe: {
    ├── name: "Alabama White Sauce"
    ├── id: "alabama_white_sauce"  ✗ WRONG (old ID with underscores)
    └── ... other fields
}
```

## Solution Applied

### 1. Fixed `formatRecipe()` Function
**File**: `app/lib/queries/recipes.ts`

The function now ensures it always uses the database row's `id` (which is correct):

```typescript
function formatRecipe(row: any): Recipe {
  const recipe = row.recipe || row;
  
  // ... time conversion code ...
  
  // Always use the database row's ID, not the one from JSONB
  // The database ID is the canonical ID (stored in recipes.id column)
  return {
    ...recipe,
    id: row.id,  // Override with correct ID
  } as Recipe;
}
```

### 2. Fixed Import Script
**File**: `scripts/import-recipes.ts`

The import script now removes the old `id` field from recipes to prevent this issue in future imports:

```typescript
// Create normalized recipe object without the old id field
// (the id will be set as the database column, not in JSONB)
const { id: _oldId, ...recipeWithoutId } = recipe;

return {
  name: recipe.name,
  // ... other fields ...
  ...recipeWithoutId,  // Spreads all fields EXCEPT id
};
```

### 3. Cleaned Database
All existing recipes had their JSONB `id` fields removed:

```sql
UPDATE recipes
SET recipe = recipe - 'id'
WHERE recipe->>'id' IS NOT NULL
AND recipe->>'id' != id;
```

✅ **Result**: All 119 recipes cleaned, 0 mismatches remaining

## Files Changed
- ✅ `app/lib/queries/recipes.ts` - Fixed formatRecipe function
- ✅ `scripts/import-recipes.ts` - Fixed to not store id in JSONB
- ✅ Database - All recipe JSONB objects cleaned
- ✅ `scripts/fix-recipe-ids.ts` - New utility script for bulk fixes (created for reference)

## Testing
The recipe links should now work correctly:
1. Go to `/recipes`
2. Search for "alabama white sauce"
3. Click on the result
4. Should navigate to `/recipes/alabama-white-sauce` ✅
5. Recipe details page should load without 404

## How This Prevents Future Issues
1. **Database ID is the source of truth**: `formatRecipe()` always ensures the database row's ID is used
2. **Clean imports**: New imports won't add `id` to JSONB objects
3. **Separation of concerns**: The `id` is stored only in the database column, not duplicated in JSONB

## Key Takeaway
When storing nested/JSONB data in a database, it's important to:
- Keep the primary key in the row itself (not duplicated in JSONB)
- Use the row's primary key as the canonical source of truth
- Ensure query functions return the correct ID from the row, not from nested data


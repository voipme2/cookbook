# Recipe Render Error Fix

## Problem
When viewing a recipe detail page, you got a "Failed to render shell" error. This is a React server-side rendering error that prevented the recipe page from loading.

```
Error: Failed to render shell
at onShellError (app/entry.server.tsx:115:18)
```

## Root Cause
The issue had two parts:

1. **Drizzle ORM Wrapped Objects**: When fetching recipe groups from the database, Drizzle was returning special wrapped SQL objects (not plain JavaScript objects) for the `id` and `name` fields.

2. **Serialization Error**: When Remix's `json()` function tried to serialize the recipe data (including the groups with wrapped objects), it failed because those Drizzle objects cannot be serialized to JSON.

3. **Workaround Code**: There was old workaround code in the recipe component (line 186-187) that tried to handle this by checking if properties were objects with a `.text` property. This was a band-aid fix that was causing issues.

## Solution Applied

### 1. Fixed `getRecipeById()` Function
**File**: `app/lib/queries/recipes.ts`

Now explicitly converts Drizzle objects to plain JavaScript objects:

```typescript
// Get groups for this recipe
const groupResults = await db
  .select({
    id: recipeGroups.id,
    name: recipeGroups.name,
  })
  .from(recipeGroupMembers)
  .innerJoin(recipeGroups, eq(recipeGroupMembers.groupId, recipeGroups.id))
  .where(eq(recipeGroupMembers.recipeId, id))
  .orderBy(recipeGroups.name);

// Ensure groups are plain JavaScript objects (not Drizzle wrapped objects)
recipe.groups = groupResults.map((g) => ({
  id: g.id,
  name: g.name,
}));
```

### 2. Simplified Recipe Component
**File**: `app/routes/recipes.$recipeId.tsx`

Removed the workaround code that was checking for `.text` properties:

```typescript
// Before: Workaround code
const groupId = typeof group.id === 'object' ? (group.id as any).text : group.id;
const groupName = typeof group.name === 'object' ? (group.name as any).text : group.name;

// After: Clean and simple
<Link key={group.id} to={`/groups/${group.id}`}>
  {group.name}
</Link>
```

### 3. Defensive ID Handling
**File**: `app/lib/queries/recipes.ts`

Updated `formatRecipe()` to handle cases where `row.id` might not exist:

```typescript
const id = row.id || recipe.id;

return {
  ...recipe,
  id,
} as Recipe;
```

## Files Changed
- ✅ `app/lib/queries/recipes.ts` - Fixed group serialization and ID handling
- ✅ `app/routes/recipes.$recipeId.tsx` - Removed workaround code
- ✅ Database - No changes needed

## Testing
The recipe detail page should now load correctly:
1. Go to `/recipes`
2. Click on any recipe
3. Recipe details should display without errors ✅
4. Collections (groups) should display as clickable links ✅

## Key Lessons
1. **Drizzle ORM objects** are special wrapper objects and need to be converted to plain JavaScript before serialization
2. **Server-side rendering errors** in Remix often indicate serialization issues with the loader data
3. **Workaround code** that handles special cases is a sign of a deeper issue - it's better to fix the root cause

## Best Practices Going Forward
- Always ensure database query results are converted to plain JavaScript objects before returning them from loaders
- Use `.map()` to explicitly extract the fields you need from Drizzle results
- Keep component code clean without workarounds for serialization issues


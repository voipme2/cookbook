# Database Maintenance Scripts

This directory contains scripts for maintaining the cookbook database.

## Scripts

### `import-recipes.js`
Imports recipes from the backup JSON file into the database.

**Usage:**
```bash
npm run import-recipes
```

### `migrate-production.js`
**IMPORTANT: Production migration script**

This script will:
1. Create a backup of all recipes before making changes
2. Update all recipe IDs to be slugified, lowercase versions of their names
3. Remove the 'id' field from all recipe JSON data
4. Handle conflicts by appending numbers to duplicate IDs

**Usage:**
```bash
npm run migrate-production
```

**⚠️ WARNING: This script modifies production data. Always run in production environment only.**

## Recipe ID Generation

Recipe IDs are generated using the `slugify` function with the following options:
- `lower: true` - Convert to lowercase

Example:
- Recipe name: "Pancakes" → ID: "pancakes"
- Recipe name: "Alabama White Sauce" → ID: "alabama-white-sauce"

## Database Schema

- All recipe IDs are slugified, lowercase versions of recipe names
- Recipe JSON does not contain an `id` field (redundant with database ID)
- Consistent ID generation for all new recipes

## Production Migration

For production environments that need to be updated to the new schema:

```bash
npm run migrate-production
``` 
# Database Migration Fix - Recipe Groups

## Problem
When accessing the groups page, you received this error:
```
error: relation "recipe_groups" does not exist
```

## Root Cause
The database was initialized with only the `recipes` table. The `recipe_groups` and `recipe_group_members` tables (which were added to `init.sql`) were not created because the database had already been initialized.

## Solution Applied
The missing tables have been manually created in your running database:
- ✅ `recipe_groups` table
- ✅ `recipe_group_members` table

The groups page should now work correctly!

## How to Prevent This in the Future

### Option 1: Fresh Database Start (Recommended)
If you ever need to restart from scratch:

```powershell
# Stop and remove the database container (this deletes all data)
docker-compose -f docker-compose.dev.yml down -v

# Restart the database (will re-run init.sql with all tables)
docker-compose -f docker-compose.dev.yml up -d
```

### Option 2: Using Drizzle Migrations
For production or team environments, use Drizzle migrations:

1. **Generate migrations** (when schema changes):
   ```powershell
   npx drizzle-kit generate --config drizzle.config.ts
   ```

2. **Run migrations**:
   ```powershell
   npm run db:migrate
   ```

## Files Changed
- **drizzle.config.ts**: Updated to use `dialect: "postgresql"` (new drizzle-kit format)
- **scripts/migrate.ts**: Created new migration runner script

## Database Schema
The following tables are now in your database:

### recipe_groups
```sql
CREATE TABLE recipe_groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### recipe_group_members
```sql
CREATE TABLE recipe_group_members (
  group_id TEXT REFERENCES recipe_groups(id) ON DELETE CASCADE,
  recipe_id TEXT REFERENCES recipes(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (group_id, recipe_id)
);
```

## Verification
To verify the tables exist, run:

```powershell
# Using Docker
docker exec cookbook-db-dev psql -U cookbook -d cookbook -c "\dt"
```

You should see all three tables:
- `recipes`
- `recipe_groups`
- `recipe_group_members`

## What's Working Now
- ✅ List recipe groups: `/groups`
- ✅ Create new groups
- ✅ Manage recipes in groups
- ✅ Add/remove recipes from groups
- ✅ Delete groups


-- Migration script to fix recipe IDs in production
-- This script will:
-- 1. Update all recipe IDs to be slugified, lowercase versions of their names
-- 2. Remove the 'id' field from the recipe JSON data
-- 3. Handle conflicts by appending a number to duplicate IDs

-- First, let's create a temporary table to store the new IDs
CREATE TEMP TABLE recipe_id_mapping (
    old_id TEXT,
    new_id TEXT,
    recipe_name TEXT
);

-- Generate new IDs for all recipes
INSERT INTO recipe_id_mapping (old_id, new_id, recipe_name)
SELECT 
    id as old_id,
    LOWER(REGEXP_REPLACE(REGEXP_REPLACE(recipe->>'name', '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g')) as new_id,
    recipe->>'name' as recipe_name
FROM recipes;

-- Handle duplicate IDs by appending numbers
WITH numbered_ids AS (
    SELECT 
        old_id,
        new_id,
        recipe_name,
        ROW_NUMBER() OVER (PARTITION BY new_id ORDER BY recipe_name) as rn
    FROM recipe_id_mapping
)
UPDATE recipe_id_mapping 
SET new_id = CASE 
    WHEN rn = 1 THEN new_id 
    ELSE new_id || '-' || (rn - 1)::text 
END
FROM numbered_ids 
WHERE recipe_id_mapping.old_id = numbered_ids.old_id;

-- Update recipe IDs
UPDATE recipes 
SET id = rim.new_id
FROM recipe_id_mapping rim
WHERE recipes.id = rim.old_id;

-- Remove the 'id' field from all recipe JSON data
UPDATE recipes 
SET recipe = recipe - 'id';

-- Show the results
SELECT 
    rim.old_id as "Old ID",
    rim.new_id as "New ID", 
    rim.recipe_name as "Recipe Name"
FROM recipe_id_mapping rim
ORDER BY rim.recipe_name;

-- Clean up
DROP TABLE recipe_id_mapping; 
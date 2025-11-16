-- Create the cookbook database if it doesn't exist
-- This will be run automatically when the PostgreSQL container starts

-- Create the recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id TEXT PRIMARY KEY,
  recipe JSONB NOT NULL
);

-- Create an index on the recipe name for better search performance
CREATE INDEX IF NOT EXISTS idx_recipes_name ON recipes USING GIN ((recipe->>'name'));

-- Create an index on the recipe description for better search performance
CREATE INDEX IF NOT EXISTS idx_recipes_description ON recipes USING GIN ((recipe->>'description')); 

-- Create the recipe groups table
CREATE TABLE IF NOT EXISTS recipe_groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the recipe group members table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS recipe_group_members (
  group_id TEXT REFERENCES recipe_groups(id) ON DELETE CASCADE,
  recipe_id TEXT REFERENCES recipes(id) ON DELETE CASCADE,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (group_id, recipe_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_recipe_group_members_group_id ON recipe_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_recipe_group_members_recipe_id ON recipe_group_members(recipe_id); 
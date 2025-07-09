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
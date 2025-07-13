export interface Ingredient {
  text: string;
}

export interface Step {
  text: string;
}

export interface RecipeOptions {
  isVegetarian: boolean;
  isVegan: boolean;
  isDairyFree: boolean;
  isCrockPot: boolean;
  isGlutenFree: boolean;
}

export interface Recipe {
  id?: string;
  name: string;
  author: string;
  description: string;
  servings?: number;
  prepTime?: string | number;
  inactiveTime?: string | number;
  cookTime?: string | number;
  ingredients: Ingredient[];
  steps: Step[];
  imageUrl?: string;
  options?: RecipeOptions;
  groups?: { id: string; name: string }[];
}

export interface SearchRecipe {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  options?: RecipeOptions;
  groups?: { id: string; name: string }[];
}

export interface DatabaseRecipe {
  id: string;
  recipe: Recipe;
}

export interface SearchFilters {
  query?: string;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isDairyFree?: boolean;
  isGlutenFree?: boolean;
  isCrockPot?: boolean;
}

export interface RecipeGroup {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  recipeCount?: number;
}

export interface RecipeGroupMember {
  groupId: string;
  recipeId: string;
  addedAt: string;
}

export interface DatabaseInterface {
  find(slugId: string): Promise<Recipe | null>;
  list(): Promise<SearchRecipe[]>;
  save(recipe: Recipe): Promise<string>;
  remove(slugId: string): Promise<void>;
  search(query: string): Promise<SearchRecipe[]>;
  searchWithFilters(filters: SearchFilters): Promise<SearchRecipe[]>;
  saveImage(recipeId: string, image: string): Promise<void>;
  
  // Recipe Groups
  createGroup(group: Omit<RecipeGroup, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>;
  updateGroup(id: string, group: Partial<RecipeGroup>): Promise<void>;
  deleteGroup(id: string): Promise<void>;
  getGroup(id: string): Promise<RecipeGroup | null>;
  listGroups(): Promise<RecipeGroup[]>;
  
  // Group Members
  addRecipeToGroup(groupId: string, recipeId: string): Promise<void>;
  removeRecipeFromGroup(groupId: string, recipeId: string): Promise<void>;
  getGroupRecipes(groupId: string): Promise<SearchRecipe[]>;
  getRecipeGroups(recipeId: string): Promise<RecipeGroup[]>;
}

export interface ScrapedRecipe {
  name: string;
  author: string;
  servings?: string;
  ingredients: Ingredient[];
  steps: Step[];
  prepTime?: string;
  cookTime?: string;
  inactiveTime?: string;
} 
export interface Ingredient {
  text: string;
}

export interface Step {
  text: string;
}

export type RecipeTime = string | number | undefined;

export interface Recipe {
  id?: string;
  name: string;
  author: string;
  description: string;
  servings?: string;
  prepTime: RecipeTime;
  inactiveTime: RecipeTime;
  cookTime: RecipeTime;
  ingredients: Ingredient[];
  steps: Step[];
  imageUrl?: string;
  options?: {
    isVegetarian: boolean;
    isVegan: boolean;
    isDairyFree: boolean;
    isCrockPot: boolean;
    isGlutenFree: boolean;
  };
  groups?: { id: string; name: string }[];
}

export interface SearchFilters {
  query?: string;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isDairyFree?: boolean;
  isGlutenFree?: boolean;
  isCrockPot?: boolean;
  groups?: string[];
}

export interface SearchRecipe {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  options?: {
    isVegetarian: boolean;
    isVegan: boolean;
    isDairyFree: boolean;
    isCrockPot: boolean;
    isGlutenFree: boolean;
  };
  groups?: { id: string; name: string }[];
}

export interface RecipeGroup {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
} 
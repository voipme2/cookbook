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
  servings?: number;
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
}

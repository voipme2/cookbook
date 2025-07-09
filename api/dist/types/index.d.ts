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
}
export interface SearchRecipe {
    id: string;
    name: string;
    description: string;
    imageUrl?: string;
    options?: RecipeOptions;
}
export interface DatabaseRecipe {
    id: string;
    recipe: Recipe;
}
export interface DatabaseInterface {
    find(slugId: string): Promise<Recipe | null>;
    list(): Promise<SearchRecipe[]>;
    save(recipe: Recipe): Promise<string>;
    remove(slugId: string): Promise<void>;
    search(query: string): Promise<SearchRecipe[]>;
    saveImage(recipeId: string, image: string): Promise<void>;
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
//# sourceMappingURL=index.d.ts.map
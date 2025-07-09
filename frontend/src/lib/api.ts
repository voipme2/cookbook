import { Recipe, SearchRecipe, SearchFilters } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiError(response.status, errorText || `HTTP ${response.status}`);
  }
  return response.json();
}

export const api = {
  // Get all recipes
  async getRecipes(): Promise<SearchRecipe[]> {
    const response = await fetch(`${API_BASE}/recipes`);
    const recipes = await handleResponse<SearchRecipe[]>(response);
    return recipes.map((recipe) => ({
      ...recipe,
      imageUrl: recipe.imageUrl && recipe.imageUrl.startsWith('/')
        ? `${API_BASE}${recipe.imageUrl}`
        : recipe.imageUrl,
    }));
  },

  // Get single recipe
  async getRecipe(id: string): Promise<Recipe> {
    const response = await fetch(`${API_BASE}/recipes/${id}`);
    const recipe = await handleResponse<Recipe>(response);
    return {
      ...recipe,
      imageUrl: recipe.imageUrl && recipe.imageUrl.startsWith('/')
        ? `${API_BASE}${recipe.imageUrl}`
        : recipe.imageUrl,
    };
  },

  // Create new recipe
  async createRecipe(recipe: Omit<Recipe, 'id'>): Promise<Recipe> {
    const response = await fetch(`${API_BASE}/recipes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(recipe),
    });
    return handleResponse<Recipe>(response);
  },

  // Update recipe
  async updateRecipe(id: string, recipe: Recipe): Promise<Recipe> {
    const response = await fetch(`${API_BASE}/recipes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(recipe),
    });
    return handleResponse<Recipe>(response);
  },

  // Delete recipe
  async deleteRecipe(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/recipes/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new ApiError(response.status, `Failed to delete recipe: ${response.statusText}`);
    }
  },

  // Search recipes
  async searchRecipes(query: string): Promise<SearchRecipe[]> {
    const response = await fetch(`${API_BASE}/search?query=${encodeURIComponent(query)}`);
    const recipes = await handleResponse<SearchRecipe[]>(response);
    return recipes.map((recipe) => ({
      ...recipe,
      imageUrl: recipe.imageUrl && recipe.imageUrl.startsWith('/')
        ? `${API_BASE}${recipe.imageUrl}`
        : recipe.imageUrl,
    }));
  },

  // Search recipes with filters
  async searchRecipesWithFilters(filters: SearchFilters): Promise<SearchRecipe[]> {
    const response = await fetch(`${API_BASE}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filters),
    });
    const recipes = await handleResponse<SearchRecipe[]>(response);
    return recipes.map((recipe) => ({
      ...recipe,
      imageUrl: recipe.imageUrl && recipe.imageUrl.startsWith('/')
        ? `${API_BASE}${recipe.imageUrl}`
        : recipe.imageUrl,
    }));
  },

  // Upload image to temp
  async uploadImage(file: File): Promise<{ success: boolean; image: { filename: string; path: string; size: number; mimetype: string } }> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE}/images/temp`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(response);
  },

  // Upload image to recipe
  async uploadRecipeImage(recipeId: string, file: File): Promise<{ success: boolean; image: { filename: string; path: string; size: number; mimetype: string } }> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE}/recipes/${recipeId}/image`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(response);
  },

  // Get image URL
  getImageUrl(filename: string): string {
    return `${API_BASE}/images/serve/recipes/${filename}`;
  },

  // Get temp image URL
  getTempImageUrl(filename: string): string {
    return `${API_BASE}/images/serve/temp/${filename}`;
  },
}; 
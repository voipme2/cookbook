import { Recipe, SearchRecipe, SearchFilters, RecipeGroup } from '@/types';

// Auto-detect API URL based on environment
const getApiBase = () => {
  // If environment variable is set, use it
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // In browser environment, use relative path
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api`;
  }
  
  // Fallback for development (server-side)
  return 'http://localhost:3001/api';
};

const API_BASE = getApiBase();

// Debug logging to help troubleshoot
if (typeof window !== 'undefined') {
  console.log('API_BASE:', API_BASE);
  console.log('Origin:', window.location.origin);
  console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
}

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
      method: 'POST',
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

  // Recipe Groups API
  async getGroups(): Promise<RecipeGroup[]> {
    const response = await fetch(`${API_BASE}/groups`);
    return handleResponse<RecipeGroup[]>(response);
  },

  async getGroup(id: string): Promise<RecipeGroup> {
    const response = await fetch(`${API_BASE}/groups/${id}`);
    return handleResponse<RecipeGroup>(response);
  },

  async createGroup(group: Omit<RecipeGroup, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ id: string }> {
    const response = await fetch(`${API_BASE}/groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(group),
    });
    return handleResponse<{ id: string }>(response);
  },

  async updateGroup(id: string, group: Partial<RecipeGroup>): Promise<{ id: string }> {
    const response = await fetch(`${API_BASE}/groups/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(group),
    });
    return handleResponse<{ id: string }>(response);
  },

  async deleteGroup(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/groups/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new ApiError(response.status, `Failed to delete group: ${response.statusText}`);
    }
  },

  async getGroupRecipes(groupId: string): Promise<SearchRecipe[]> {
    const response = await fetch(`${API_BASE}/groups/${groupId}/recipes`);
    const recipes = await handleResponse<SearchRecipe[]>(response);
    return recipes.map((recipe) => ({
      ...recipe,
      imageUrl: recipe.imageUrl && recipe.imageUrl.startsWith('/')
        ? `${API_BASE}${recipe.imageUrl}`
        : recipe.imageUrl,
    }));
  },

  async addRecipeToGroup(groupId: string, recipeId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/groups/${groupId}/recipes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ recipeId }),
    });
    if (!response.ok) {
      throw new ApiError(response.status, `Failed to add recipe to group: ${response.statusText}`);
    }
  },

  async removeRecipeFromGroup(groupId: string, recipeId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/groups/${groupId}/recipes/${recipeId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new ApiError(response.status, `Failed to remove recipe from group: ${response.statusText}`);
    }
  },

  async getRecipeGroups(recipeId: string): Promise<RecipeGroup[]> {
    const response = await fetch(`${API_BASE}/recipes/${recipeId}/groups`);
    return handleResponse<RecipeGroup[]>(response);
  },
}; 